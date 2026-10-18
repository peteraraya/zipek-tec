"use server";

import { createHash, randomBytes } from "node:crypto";
import { Resend } from "resend";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServiceDocumentPdf } from "@/lib/admin/document-pdf";
import { requireStaff } from "@/lib/admin/auth";
import { getDocumentTemplate } from "@/lib/admin/document-templates";
import type { ServiceDocumentRecord } from "@/lib/admin/types";

export type DocumentSaveState = {
  error?: string;
  documentId?: string;
};

export type DocumentEmailState = {
  error?: string;
  success?: string;
};

export type ProposalDraftState = {
  error?: string;
  documentId?: string;
};

async function logDocumentDelivery(
  supabase: Awaited<ReturnType<typeof requireStaff>>["supabase"],
  actorId: string,
  documentId: string,
  result: "sent" | "failed",
  errorCode: string | null,
) {
  const { error } = await supabase.from("admin_email_delivery_events").insert({
    actor_id: actorId,
    document_id: documentId,
    result,
    error_code: errorCode,
  });
  if (error) throw new Error(`No se pudo registrar el resultado del correo: ${error.message}`);
}

const uuidSchema = z.string().uuid("El identificador no es válido.");
const emailSchema = z.string().trim().email("Ingresa un correo electrónico válido.").max(254);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const proposalCurrencyFields = new Set(["mano_obra", "repuestos_licencias", "traslado", "total"]);

function documentHtml(
  document: ServiceDocumentRecord,
  clientName: string,
  proposalApprovalUrl?: string,
) {
  const template = getDocumentTemplate(document.template_id);
  if (!template) throw new Error("El tipo de documento guardado ya no está disponible.");

  const sections = template.sections.map((section) => {
    const fields = (section.fields ?? []).map((fieldName) => {
      const field = template.fields.find((field) => field.name === fieldName);
      if (!field) return "";
      const rawValue = document.data[fieldName]?.trim() ?? "";
      const value = proposalCurrencyFields.has(fieldName) && /^\d+$/.test(rawValue)
        ? new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(Number(rawValue))
        : rawValue || "No indicado";
      return `<p><strong>${escapeHtml(field.label)}:</strong> ${escapeHtml(value).replaceAll("\n", "<br>")}</p>`;
    }).join("");
    const paragraphs = (section.paragraphs ?? [])
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("");
    return `<section><h2>${escapeHtml(section.title)}</h2>${fields}${paragraphs}</section>`;
  }).join("");

  return `<!doctype html>
    <html lang="es"><body style="font-family:Arial,sans-serif;color:#202124;line-height:1.55;max-width:720px;margin:auto">
      <header style="border-bottom:1px solid #ccc;padding-bottom:12px">
        <h1 style="font-size:22px;margin-bottom:4px">ZIPEK TECNOLOGÍA</h1>
        <p style="margin:0">Documento para ${escapeHtml(clientName)}</p>
      </header>
      <h1 style="font-size:20px">${escapeHtml(template.title)}</h1>
      ${sections}
      ${proposalApprovalUrl ? `<section style="margin-top:24px;padding:16px;background:#f0f9fa;border:1px solid #b6e2e5;border-radius:8px">
        <h2 style="margin-top:0;font-size:18px">Revisa y responde la propuesta</h2>
        <p>El enlace seguro permite aceptar o rechazar esta propuesta hasta el ${escapeHtml(document.data.valida_hasta)}. La aceptación deja constancia de tu autorización para el alcance y total indicados; no autoriza trabajos adicionales.</p>
        <p><a href="${escapeHtml(proposalApprovalUrl)}" style="display:inline-block;padding:12px 18px;background:#087a8a;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold">Revisar propuesta</a></p>
        <p style="font-size:12px;color:#555">Si no esperabas este correo, no uses el enlace y comunícate con Zipek por un canal que ya conozcas.</p>
      </section>` : ""}
      <footer style="border-top:1px solid #ccc;margin-top:28px;padding-top:12px;font-size:12px">
        ZIPEK TECNOLOGÍA SpA · Quillota, Región de Valparaíso
      </footer>
    </body></html>`;
}

export async function saveServiceDocumentAction(
  _state: DocumentSaveState,
  formData: FormData,
): Promise<DocumentSaveState> {
  const { supabase, user } = await requireStaff("documents.manage");
  const templateId = String(formData.get("template_id") ?? "");
  const template = getDocumentTemplate(templateId);
  if (!template) return { error: "Selecciona un tipo de documento válido." };

  const clientId = String(formData.get("client_id") ?? "");
  const orderId = String(formData.get("order_id") ?? "").trim() || null;
  const documentId = String(formData.get("document_id") ?? "").trim() || null;

  if (!uuidSchema.safeParse(clientId).success) return { error: "Selecciona un cliente válido." };
  if (orderId && !uuidSchema.safeParse(orderId).success) return { error: "La orden asociada no es válida." };
  if (documentId && !uuidSchema.safeParse(documentId).success) return { error: "El identificador del documento no es válido." };

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .maybeSingle();
  if (clientError) throw new Error(`No se pudo verificar el cliente: ${clientError.message}`);
  if (!client) return { error: "El cliente seleccionado no existe." };

  if (orderId) {
    const { data: order, error: orderError } = await supabase
      .from("service_orders")
      .select("id")
      .eq("id", orderId)
      .eq("client_id", clientId)
      .maybeSingle();
    if (orderError) throw new Error(`No se pudo verificar la orden: ${orderError.message}`);
    if (!order) return { error: "La orden no corresponde al cliente seleccionado." };
  }

  const data: Record<string, string> = {};
  for (const field of template.fields) {
    const raw = formData.get(`data_${field.name}`);
    const value = field.type === "checkbox"
      ? (raw === "yes" ? "Sí" : "No")
      : typeof raw === "string" ? raw.trim() : "";
    const maxLength = field.type === "textarea" ? 10000 : 500;
    if (value.length > maxLength) {
      return { error: `El campo “${field.label}” supera el largo permitido.` };
    }
    if (field.required && !value) return { error: `Completa el campo “${field.label}”.` };
    data[field.name] = value;
  }

  if (template.id === "service-proposal") {
    const amountFields = ["mano_obra", "repuestos_licencias", "traslado"] as const;
    let total = 0;
    let hasAmount = false;
    for (const field of amountFields) {
      const amount = data[field];
      if (!amount) continue;
      if (!/^\d{1,9}$/.test(amount)) {
        return { error: "Ingresa los costos en pesos chilenos como números enteros, sin puntos ni decimales." };
      }
      hasAmount = true;
      total += Number(amount);
    }
    if (!hasAmount || total > 999_999_999) {
      return { error: "Ingresa al menos un costo y verifica que el total no supere $999.999.999." };
    }
    data.total = String(total);

    const expiry = data.valida_hasta;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiry) || Number.isNaN(Date.parse(`${expiry}T00:00:00Z`))) {
      return { error: "Indica una fecha de vigencia válida para la propuesta." };
    }
    const expiryDate = new Date(`${expiry}T00:00:00Z`);
    if (expiryDate.toISOString().slice(0, 10) !== expiry || expiry < new Date().toISOString().slice(0, 10)) {
      return { error: "La propuesta debe vencer hoy o en una fecha futura." };
    }
    const proposalDate = new Date(`${data.fecha}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.fecha)
      || Number.isNaN(proposalDate.getTime())
      || proposalDate.toISOString().slice(0, 10) !== data.fecha
      || expiry < data.fecha) {
      return { error: "Verifica las fechas de emisión y vigencia de la propuesta." };
    }
  }

  if (documentId) {
    const { data: saved, error } = await supabase
      .from("service_documents")
      .update({
        client_id: clientId,
        order_id: orderId,
        template_id: template.id,
        data,
        status: "draft",
        sent_to: null,
        sent_at: null,
      })
      .eq("id", documentId)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(`No se pudo guardar el documento: ${error.message}`);
    if (!saved) return { error: "El documento no existe o ya no tienes permiso para modificarlo." };
    revalidatePath("/admin/documentos");
    revalidatePath(`/admin/documentos/${documentId}`);
    return { documentId };
  }

  const { data: saved, error } = await supabase
    .from("service_documents")
    .insert({
      client_id: clientId,
      order_id: orderId,
      template_id: template.id,
      data,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (error) throw new Error(`No se pudo crear el borrador: ${error.message}`);

  revalidatePath("/admin/documentos");
  return { documentId: saved.id };
}

export async function createServiceProposalDraftFromInquiryAction(
  _state: ProposalDraftState,
  formData: FormData,
): Promise<ProposalDraftState> {
  const { supabase } = await requireStaff("documents.manage");
  const inquiryId = String(formData.get("inquiry_id") ?? "");
  if (!uuidSchema.safeParse(inquiryId).success) {
    return { error: "La referencia de consulta no es válida." };
  }

  const { data, error } = await supabase.rpc("create_service_proposal_draft_from_inquiry", {
    p_inquiry_id: inquiryId,
  });
  if (error) {
    console.error("No se pudo crear el borrador de cotización desde la consulta.", error);
    return {
      error: error.code === "42501"
        ? "Tu perfil no tiene permisos para crear un cliente y una propuesta desde esta consulta."
        : "No se pudo crear la propuesta. Verifica que la migración de cotizaciones esté aplicada y que la consulta tenga datos de contacto autorizados.",
    };
  }
  if (typeof data !== "string" || !uuidSchema.safeParse(data).success) {
    throw new Error("La base de datos no devolvió el identificador de la propuesta.");
  }

  revalidatePath("/admin/documentos");
  revalidatePath(`/admin/consultas/${inquiryId}`);
  return { documentId: data };
}

export async function sendServiceDocumentEmailAction(
  _state: DocumentEmailState,
  formData: FormData,
): Promise<DocumentEmailState> {
  const { supabase, user } = await requireStaff("documents.manage");
  const documentId = String(formData.get("document_id") ?? "");
  const recipientResult = emailSchema.safeParse(formData.get("recipient"));
  if (!uuidSchema.safeParse(documentId).success) return { error: "El documento seleccionado no es válido." };
  if (!recipientResult.success) return { error: "Ingresa un correo electrónico válido." };

  const { data, error } = await supabase
    .from("service_documents")
    .select("*")
    .eq("id", documentId)
    .single();
  if (error) throw new Error(`No se pudo cargar el documento para enviarlo: ${error.message}`);
  const document = data as ServiceDocumentRecord;

  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !sender) {
    await logDocumentDelivery(supabase, user.id, documentId, "failed", "email_not_configured");
    return { error: "Configura RESEND_API_KEY y RESEND_FROM_EMAIL con un remitente verificado para habilitar el envío." };
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("full_name")
    .eq("id", document.client_id)
    .single();
  if (clientError) throw new Error(`No se pudo cargar el cliente del documento: ${clientError.message}`);

  const template = getDocumentTemplate(document.template_id);
  if (!template) throw new Error("El tipo de documento guardado ya no está disponible.");
  const missingFields = template.fields.filter(
    (field) => field.requiredForSend && !document.data[field.name]?.trim(),
  );
  if (missingFields.length > 0) {
    return { error: `Completa antes de enviar: ${missingFields.map((field) => field.label).join(", ")}.` };
  }

  let proposalApprovalUrl: string | undefined;
  if (document.template_id === "service-proposal") {
    const amountFields = ["mano_obra", "repuestos_licencias", "traslado"] as const;
    const amounts = amountFields.map((field) => document.data[field] ?? "");
    if (amounts.some((amount) => amount && !/^\d{1,9}$/.test(amount))
      || !amounts.some((amount) => amount)) {
      return { error: "La propuesta tiene costos incompletos o inválidos. Corrige el borrador antes de enviarlo." };
    }
    const calculatedTotal = amounts.reduce((total, amount) => total + Number(amount || 0), 0);
    if (calculatedTotal > 999_999_999 || Number(document.data.total) !== calculatedTotal) {
      return { error: "El total de la propuesta no coincide con sus costos. Guarda los cambios y vuelve a intentarlo." };
    }

    const expiry = document.data.valida_hasta;
    const expiresOn = new Date(`${expiry}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiry)
      || Number.isNaN(expiresOn.getTime())
      || expiresOn.toISOString().slice(0, 10) !== expiry
      || expiry < new Date().toISOString().slice(0, 10)
      || expiry < document.data.fecha) {
      return { error: "La vigencia de la propuesta debe ser hoy o una fecha futura." };
    }
    const proposalDateValue = document.data.fecha ?? "";
    const proposalDate = new Date(`${proposalDateValue}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(proposalDateValue)
      || Number.isNaN(proposalDate.getTime())
      || proposalDate.toISOString().slice(0, 10) !== proposalDateValue
      || expiry < proposalDateValue) {
      return { error: "Verifica la fecha de emisión y vigencia de la propuesta antes de enviarla." };
    }

    const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!publicSiteUrl) {
      return { error: "Configura NEXT_PUBLIC_SITE_URL antes de enviar una propuesta con aprobación digital." };
    }
    let siteOrigin: URL;
    try {
      siteOrigin = new URL(publicSiteUrl);
    } catch {
      return { error: "NEXT_PUBLIC_SITE_URL no es una URL válida." };
    }
    if (siteOrigin.protocol !== "https:" && siteOrigin.hostname !== "localhost") {
      return { error: "NEXT_PUBLIC_SITE_URL debe usar HTTPS para habilitar la aprobación digital." };
    }

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const { error: approvalError } = await supabase.rpc("create_service_proposal_approval", {
      p_document_id: document.id,
      p_token_hash: tokenHash,
      p_expires_on: expiry,
    });
    if (approvalError) {
      console.error("No se pudo generar el enlace seguro de aprobación de la propuesta.", approvalError);
      return { error: "No se pudo preparar la aprobación digital. Revisa la migración de cotizaciones e inténtalo nuevamente." };
    }
    proposalApprovalUrl = new URL(`/propuesta#${token}`, siteOrigin).toString();
  }

  let orderNumber: string | undefined;
  if (document.order_id) {
    const { data: order, error: orderError } = await supabase
      .from("service_orders")
      .select("order_number")
      .eq("id", document.order_id)
      .maybeSingle();
    if (orderError) throw new Error(`No se pudo cargar la orden asociada: ${orderError.message}`);
    orderNumber = order?.order_number;
  }

  let pdf: Uint8Array;
  try {
    pdf = await createServiceDocumentPdf(document, client.full_name, orderNumber);
  } catch (error) {
    console.error(JSON.stringify({
      event: "service_document_pdf_failed",
      document_id: documentId,
      error_type: error instanceof Error ? error.name : "UnknownError",
    }));
    await logDocumentDelivery(supabase, user.id, documentId, "failed", "pdf_generation_error");
    return { error: "No se pudo generar el PDF. El documento no fue enviado." };
  }

  const resend = new Resend(apiKey);
  let sendFailed = false;
  try {
    const { error: emailError } = await resend.emails.send({
      from: sender,
      to: recipientResult.data,
      subject: `${template.title} · Zipek Tecnología`,
      html: documentHtml(document, client.full_name, proposalApprovalUrl),
      attachments: [{
        filename: `${template.id}-${document.id.slice(0, 8)}.pdf`,
        content: Buffer.from(pdf).toString("base64"),
      }],
    });
    if (emailError) {
      sendFailed = true;
    }
  } catch {
    sendFailed = true;
  }
  if (sendFailed) {
    console.error(JSON.stringify({ event: "service_document_email_failed", document_id: documentId }));
    await logDocumentDelivery(supabase, user.id, documentId, "failed", "provider_error");
    return { error: "No se pudo enviar el documento. No se marcó como enviado." };
  }

  const { error: updateError } = await supabase
    .from("service_documents")
    .update({
      status: "sent",
      sent_to: recipientResult.data,
      sent_at: new Date().toISOString(),
    })
    .eq("id", documentId);
  if (updateError) {
    await logDocumentDelivery(supabase, user.id, documentId, "sent", null);
    console.error(JSON.stringify({ event: "service_document_status_update_failed", document_id: documentId }));
    return { error: "El correo se envió, pero no se pudo actualizar el historial del documento. Revisa el registro antes de reenviarlo." };
  }

  await logDocumentDelivery(supabase, user.id, documentId, "sent", null);
  console.info(JSON.stringify({ event: "service_document_email_sent", document_id: documentId }));
  revalidatePath("/admin/documentos");
  revalidatePath(`/admin/documentos/${documentId}`);
  return { success: `Documento enviado a ${recipientResult.data}.` };
}
