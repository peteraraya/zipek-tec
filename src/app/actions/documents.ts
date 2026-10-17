"use server";

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

function documentHtml(document: ServiceDocumentRecord, clientName: string) {
  const template = getDocumentTemplate(document.template_id);
  if (!template) throw new Error("El tipo de documento guardado ya no está disponible.");

  const sections = template.sections.map((section) => {
    const fields = (section.fields ?? []).map((fieldName) => {
      const field = template.fields.find((field) => field.name === fieldName);
      if (!field) return "";
      const value = document.data[fieldName]?.trim() || "No indicado";
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
      <footer style="border-top:1px solid #ccc;margin-top:28px;padding-top:12px;font-size:12px">
        ZIPEK TECNOLOGÍA SpA · Quillota, Región de Valparaíso
      </footer>
    </body></html>`;
}

export async function saveServiceDocumentAction(
  _state: DocumentSaveState,
  formData: FormData,
): Promise<DocumentSaveState> {
  const { supabase, user } = await requireStaff();
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

export async function sendServiceDocumentEmailAction(
  _state: DocumentEmailState,
  formData: FormData,
): Promise<DocumentEmailState> {
  const { supabase } = await requireStaff();
  const documentId = String(formData.get("document_id") ?? "");
  const recipientResult = emailSchema.safeParse(formData.get("recipient"));
  if (!uuidSchema.safeParse(documentId).success) return { error: "El documento seleccionado no es válido." };
  if (!recipientResult.success) return { error: "Ingresa un correo electrónico válido." };

  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !sender) {
    return { error: "Configura RESEND_API_KEY y RESEND_FROM_EMAIL con un remitente verificado para habilitar el envío." };
  }

  const { data, error } = await supabase
    .from("service_documents")
    .select("*")
    .eq("id", documentId)
    .single();
  if (error) throw new Error(`No se pudo cargar el documento para enviarlo: ${error.message}`);
  const document = data as ServiceDocumentRecord;

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
    console.error("No se pudo generar el PDF del documento", error);
    return { error: "No se pudo generar el PDF. El documento no fue enviado." };
  }

  const resend = new Resend(apiKey);
  try {
    const { error: emailError } = await resend.emails.send({
      from: sender,
      to: recipientResult.data,
      subject: `${template.title} · Zipek Tecnología`,
      html: documentHtml(document, client.full_name),
      attachments: [{
        filename: `${template.id}-${document.id.slice(0, 8)}.pdf`,
        content: Buffer.from(pdf).toString("base64"),
      }],
    });
    if (emailError) {
      console.error("No se pudo enviar el documento por correo", emailError);
      return { error: "El proveedor de correo no pudo enviar el documento. No se marcó como enviado." };
    }
  } catch (error) {
    console.error("Falló el envío de correo con PDF adjunto", error);
    return { error: "No se pudo enviar el correo. El documento no se marcó como enviado." };
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
    console.error("El correo del documento fue enviado, pero no se pudo actualizar su registro", updateError);
    return { error: "El correo se envió, pero no se pudo actualizar el historial del documento. Revisa el registro antes de reenviarlo." };
  }

  revalidatePath("/admin/documentos");
  revalidatePath(`/admin/documentos/${documentId}`);
  return { success: `Documento enviado a ${recipientResult.data}.` };
}
