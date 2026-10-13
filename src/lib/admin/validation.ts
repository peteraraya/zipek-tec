import { z } from "zod";

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional(),
  );

export const clientSchema = z.object({
  full_name: z.string().trim().min(2, "Ingresa el nombre del cliente.").max(160),
  rut: optionalText(20),
  phone: z.string().trim().min(6, "Ingresa un teléfono válido.").max(40),
  email: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().email("Ingresa un correo válido.").max(254).optional(),
  ),
  address: optionalText(300),
  notes: optionalText(2000),
});

export const orderSchema = z.object({
  client_id: z.string().uuid("Selecciona un cliente."),
  service_type: z.string().trim().min(2).max(100),
  service_description: z.string().trim().min(3).max(2000),
  priority: z.enum(["standard", "urgent"]),
  quoted_amount: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().min(0).max(999999999).optional(),
  ),
  payment_method: optionalText(80),
  equipment_brand: optionalText(100),
  equipment_model: optionalText(100),
  equipment_serial: optionalText(120),
  reported_problem: z.string().trim().min(3).max(2000),
  authorized_work: z.string().trim().min(3).max(2000),
  backup_status: z.enum(["pending", "completed", "declined", "not_required"]),
  initial_condition: optionalText(2000),
  warranty_days: z.coerce.number().int().min(0).max(365),
});

export const statusUpdateSchema = z.object({
  order_id: z.string().uuid(),
  status: z.enum([
    "received",
    "diagnosis",
    "awaiting_approval",
    "in_progress",
    "ready",
    "delivered",
    "cancelled",
  ]),
  public_message: optionalText(500),
});

export const taskSchema = z.object({
  order_id: z.string().uuid(),
  description: z.string().trim().min(3).max(1000),
  completed: z.enum(["true", "false"]),
});

export const reportSchema = z.object({
  order_id: z.string().uuid(),
  diagnosis: optionalText(4000),
  backup_status: z.enum(["pending", "completed", "declined", "not_required"]),
  backup_details: optionalText(2000),
  software_installed: z.string().max(10000),
  recommendations: optionalText(4000),
});

const inquiryContactFields = {
  contact_name: optionalText(160),
  contact_phone: optionalText(40),
  contact_email: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().email("Ingresa un correo válido.").max(254).optional(),
  ),
  contact_consent: z.preprocess(
    (value) => value === true || value === "on" || value === "true",
    z.boolean(),
  ),
};

function validateInquiryContact(
  data: {
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
    contact_consent: boolean;
  },
  context: z.RefinementCtx,
) {
  const hasContactData = Boolean(data.contact_name || data.contact_phone || data.contact_email);
  if (hasContactData && !data.contact_consent) {
    context.addIssue({
      code: "custom",
      path: ["contact_consent"],
      message: "Se requiere autorización para guardar los datos de contacto.",
    });
  }
  if (data.contact_consent && !data.contact_phone && !data.contact_email) {
    context.addIssue({
      code: "custom",
      path: ["contact_phone"],
      message: "Ingresa teléfono o correo para poder responder.",
    });
  }
}

export const publicInquirySchema = z.object({
  topic: z.string().trim().min(3, "Indica el tema de tu consulta.").max(100),
  message: z.string().trim().min(10, "Escribe una consulta de al menos 10 caracteres.").max(3000),
  ...inquiryContactFields,
}).strict().superRefine(validateInquiryContact);

export const whatsappInquirySchema = z.object({
  topic: z.string().trim().min(3, "Indica el tema de la consulta.").max(100),
  message: z.string().trim().min(10, "Registra el contenido de la consulta.").max(3000),
  ...inquiryContactFields,
}).superRefine(validateInquiryContact);

export const inquiryStatusSchema = z.object({
  inquiry_id: z.string().uuid("Identificador de consulta inválido."),
  status: z.enum(["new", "in_progress", "waiting_customer", "resolved", "closed"]),
});

export const inquiryNoteSchema = z.object({
  inquiry_id: z.string().uuid("Identificador de consulta inválido."),
  note: z.string().trim().min(3, "La nota debe tener al menos 3 caracteres.").max(3000),
});

export function readForm(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

export function firstValidationError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Revisa los datos ingresados.";
}
