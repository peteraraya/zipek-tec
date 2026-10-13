"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";
import { requireStaff } from "@/lib/admin/auth";
import {
  clientSchema,
  firstValidationError,
  inquiryNoteSchema,
  inquiryStatusSchema,
  orderSchema,
  readForm,
  reportSchema,
  statusUpdateSchema,
  taskSchema,
  whatsappInquirySchema,
} from "@/lib/admin/validation";
import type { ServiceOrderRecord } from "@/lib/admin/types";

export type OrderCreateState = {
  error?: string;
  orderNumber?: string;
  trackingUrl?: string;
};

export type InquiryCreateState = {
  error?: string;
  inquiryId?: string;
  inquiryNumber?: string;
};

function getOptional(value: string | undefined) {
  return value?.trim() || null;
}

export async function createClientAction(formData: FormData) {
  const { supabase, user } = await requireStaff();
  const parsed = clientSchema.safeParse(readForm(formData));
  if (!parsed.success) redirect(`/admin/clientes?error=${encodeURIComponent(firstValidationError(parsed.error))}`);

  const { error } = await supabase.from("clients").insert({
    full_name: parsed.data.full_name,
    rut: getOptional(parsed.data.rut),
    phone: parsed.data.phone,
    email: getOptional(parsed.data.email),
    address: getOptional(parsed.data.address),
    notes: getOptional(parsed.data.notes),
    created_by: user.id,
  });
  if (error) throw new Error(`No se pudo crear el cliente: ${error.message}`);

  revalidatePath("/admin");
  revalidatePath("/admin/clientes");
  redirect("/admin/clientes?created=1");
}

export async function updateClientAction(formData: FormData) {
  const { supabase } = await requireStaff();
  const id = String(formData.get("id") ?? "");
  const parsed = clientSchema.safeParse(readForm(formData));
  if (!/^[0-9a-f-]{36}$/i.test(id) || !parsed.success) {
    redirect(`/admin/clientes/${encodeURIComponent(id)}?error=${encodeURIComponent(
      !parsed.success ? firstValidationError(parsed.error) : "Identificador de cliente inválido.",
    )}`);
  }

  const { error } = await supabase
    .from("clients")
    .update({
      full_name: parsed.data.full_name,
      rut: getOptional(parsed.data.rut),
      phone: parsed.data.phone,
      email: getOptional(parsed.data.email),
      address: getOptional(parsed.data.address),
      notes: getOptional(parsed.data.notes),
    })
    .eq("id", id)
    .select("id")
    .single();
  if (error) throw new Error(`No se pudo actualizar el cliente: ${error.message}`);

  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${id}`);
  redirect("/admin/clientes?updated=1");
}

export async function archiveClientAction(formData: FormData) {
  const { supabase } = await requireStaff();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Identificador de cliente inválido.");

  const { error } = await supabase
    .from("clients")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .single();
  if (error) throw new Error(`No se pudo archivar el cliente: ${error.message}`);

  revalidatePath("/admin/clientes");
  redirect("/admin/clientes");
}

export async function createOrderAction(
  _state: OrderCreateState,
  formData: FormData,
): Promise<OrderCreateState> {
  const { supabase } = await requireStaff();
  const parsed = orderSchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: firstValidationError(parsed.error) };

  const trackingToken = randomBytes(32).toString("base64url");
  const trackingTokenHash = createHash("sha256").update(trackingToken).digest("hex");
  const input = parsed.data;
  const { data, error } = await supabase.rpc("create_service_order", {
    p_client_id: input.client_id,
    p_service_type: input.service_type,
    p_service_description: input.service_description,
    p_priority: input.priority,
    p_quoted_amount: input.quoted_amount ?? null,
    p_payment_method: input.payment_method ?? null,
    p_equipment_brand: input.equipment_brand ?? null,
    p_equipment_model: input.equipment_model ?? null,
    p_equipment_serial: input.equipment_serial ?? null,
    p_reported_problem: input.reported_problem,
    p_authorized_work: input.authorized_work,
    p_backup_status: input.backup_status,
    p_initial_condition: input.initial_condition ?? null,
    p_warranty_days: input.warranty_days,
    p_tracking_token_hash: trackingTokenHash,
  });

  if (error) {
    console.error("No se pudo crear la orden de servicio", error);
    return { error: "No se pudo guardar la orden. Revisa la configuración y los datos." };
  }

  const created = Array.isArray(data) ? (data[0] as { id: string; order_number: string } | undefined) : undefined;
  if (!created?.id || !created.order_number) {
    throw new Error("La base de datos no devolvió la orden creada.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/ordenes");
  return {
    orderNumber: created.order_number,
    trackingUrl: new URL(
      `/seguimiento#${trackingToken}`,
      process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url,
    ).toString(),
  };
}

export async function updateOrderStatusAction(formData: FormData) {
  const { supabase } = await requireStaff();
  const parsed = statusUpdateSchema.safeParse(readForm(formData));
  if (!parsed.success) throw new Error(firstValidationError(parsed.error));

  const { error } = await supabase.rpc("update_service_order_status", {
    p_order_id: parsed.data.order_id,
    p_status: parsed.data.status,
    p_public_message: parsed.data.public_message ?? null,
  });
  if (error) throw new Error(`No se pudo actualizar el estado: ${error.message}`);

  revalidatePath("/admin");
  revalidatePath("/admin/ordenes");
  revalidatePath(`/admin/ordenes/${parsed.data.order_id}`);
}

export async function logServiceTaskAction(formData: FormData) {
  const { supabase } = await requireStaff();
  const parsed = taskSchema.safeParse(readForm(formData));
  if (!parsed.success) throw new Error(firstValidationError(parsed.error));

  const { error } = await supabase.rpc("log_service_task", {
    p_order_id: parsed.data.order_id,
    p_description: parsed.data.description,
    p_completed: parsed.data.completed === "true",
  });
  if (error) throw new Error(`No se pudo registrar la tarea: ${error.message}`);

  revalidatePath(`/admin/ordenes/${parsed.data.order_id}`);
}

export async function updateServiceReportAction(formData: FormData) {
  const { supabase } = await requireStaff();
  const parsed = reportSchema.safeParse(readForm(formData));
  if (!parsed.success) throw new Error(firstValidationError(parsed.error));

  let softwareInstalled: ServiceOrderRecord["software_installed"];
  try {
    const rawSoftware = JSON.parse(parsed.data.software_installed || "[]");
    if (!Array.isArray(rawSoftware) || rawSoftware.length > 50) {
      throw new Error("La lista de programas no es válida.");
    }
    softwareInstalled = rawSoftware.map((item: unknown) => {
      if (
        typeof item !== "object" ||
        item === null ||
        typeof (item as Record<string, unknown>).name !== "string" ||
        typeof (item as Record<string, unknown>).license_type !== "string" ||
        typeof (item as Record<string, unknown>).notes !== "string"
      ) {
        throw new Error("Cada programa debe incluir nombre, tipo de licencia y observación.");
      }
      const program = item as { name: string; license_type: string; notes: string };
      if (program.name.length > 120 || program.license_type.length > 80 || program.notes.length > 500) {
        throw new Error("Un campo de programa supera el largo permitido.");
      }
      return program;
    });
  } catch (error) {
    return redirect(
      `/admin/ordenes/${parsed.data.order_id}?error=${encodeURIComponent(
        error instanceof Error ? error.message : "Lista de programas inválida.",
      )}`,
    );
  }

  const { error } = await supabase.rpc("update_service_report", {
    p_order_id: parsed.data.order_id,
    p_diagnosis: parsed.data.diagnosis ?? "",
    p_backup_status: parsed.data.backup_status,
    p_backup_details: parsed.data.backup_details ?? "",
    p_software_installed: softwareInstalled,
    p_recommendations: parsed.data.recommendations ?? "",
  });
  if (error) throw new Error(`No se pudo actualizar el informe: ${error.message}`);

  revalidatePath(`/admin/ordenes/${parsed.data.order_id}`);
  redirect(`/admin/ordenes/${parsed.data.order_id}?reportUpdated=1`);
}

export async function createWhatsAppInquiryAction(
  _state: InquiryCreateState,
  formData: FormData,
): Promise<InquiryCreateState> {
  const { supabase } = await requireStaff();
  const parsed = whatsappInquirySchema.safeParse(readForm(formData));
  if (!parsed.success) return { error: firstValidationError(parsed.error) };

  const { data, error } = await supabase.rpc("create_whatsapp_service_inquiry", {
    p_topic: parsed.data.topic,
    p_message: parsed.data.message,
    p_contact_name: parsed.data.contact_name ?? null,
    p_contact_phone: parsed.data.contact_phone ?? null,
    p_contact_email: parsed.data.contact_email ?? null,
    p_contact_consent: parsed.data.contact_consent,
  });
  if (error) {
    console.error("No se pudo registrar la consulta de WhatsApp", error);
    return { error: "No se pudo registrar la consulta. Revisa la configuración y los datos." };
  }

  const created = Array.isArray(data)
    ? (data[0] as { id: string; inquiry_number: string } | undefined)
    : undefined;
  if (!created?.id || !created.inquiry_number) {
    throw new Error("La base de datos no devolvió la consulta creada.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/consultas");
  return { inquiryId: created.id, inquiryNumber: created.inquiry_number };
}

export async function updateInquiryStatusAction(formData: FormData) {
  const { supabase } = await requireStaff();
  const parsed = inquiryStatusSchema.safeParse(readForm(formData));
  if (!parsed.success) throw new Error(firstValidationError(parsed.error));

  const { error } = await supabase.rpc("update_service_inquiry_status", {
    p_inquiry_id: parsed.data.inquiry_id,
    p_status: parsed.data.status,
  });
  if (error) throw new Error(`No se pudo actualizar el estado de la consulta: ${error.message}`);

  revalidatePath("/admin");
  revalidatePath("/admin/consultas");
  revalidatePath(`/admin/consultas/${parsed.data.inquiry_id}`);
}

export async function addInquiryNoteAction(formData: FormData) {
  const { supabase } = await requireStaff();
  const parsed = inquiryNoteSchema.safeParse(readForm(formData));
  if (!parsed.success) throw new Error(firstValidationError(parsed.error));

  const { error } = await supabase.rpc("add_service_inquiry_note", {
    p_inquiry_id: parsed.data.inquiry_id,
    p_note: parsed.data.note,
  });
  if (error) throw new Error(`No se pudo guardar la nota: ${error.message}`);

  revalidatePath(`/admin/consultas/${parsed.data.inquiry_id}`);
}
