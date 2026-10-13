export type ServiceStatus =
  | "received"
  | "diagnosis"
  | "awaiting_approval"
  | "in_progress"
  | "ready"
  | "delivered"
  | "cancelled";

export type ServicePriority = "standard" | "urgent";

export type ServiceInquirySource = "web" | "whatsapp";
export type ServiceInquiryStatus =
  | "new"
  | "in_progress"
  | "waiting_customer"
  | "resolved"
  | "closed";

export const serviceInquiryStatusLabels: Record<ServiceInquiryStatus, string> = {
  new: "Nueva",
  in_progress: "En atención",
  waiting_customer: "Esperando al cliente",
  resolved: "Resuelta",
  closed: "Cerrada",
};

export const serviceInquirySourceLabels: Record<ServiceInquirySource, string> = {
  web: "Formulario web",
  whatsapp: "WhatsApp",
};

export const serviceStatusLabels: Record<ServiceStatus, string> = {
  received: "Recibido",
  diagnosis: "En diagnóstico",
  awaiting_approval: "Esperando aprobación",
  in_progress: "En trabajo",
  ready: "Listo para entrega",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export interface ServiceInquiryRecord {
  id: string;
  inquiry_number: string;
  source: ServiceInquirySource;
  status: ServiceInquiryStatus;
  topic: string;
  message: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceInquiryEvent {
  id: string;
  event_type: "created" | "status_changed" | "note_added";
  previous_status: ServiceInquiryStatus | null;
  new_status: ServiceInquiryStatus | null;
  summary: string;
  created_at: string;
}

export interface ClientRecord {
  id: string;
  full_name: string;
  rut: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
}

export interface ServiceOrderRecord {
  id: string;
  order_number: string;
  client_id: string;
  service_type: string;
  service_description: string;
  status: ServiceStatus;
  priority: ServicePriority;
  quoted_amount: number | null;
  payment_method: string | null;
  equipment_brand: string | null;
  equipment_model: string | null;
  equipment_serial: string | null;
  reported_problem: string;
  diagnosis: string | null;
  authorized_work: string;
  backup_status: "pending" | "completed" | "declined" | "not_required";
  backup_details: string | null;
  initial_condition: string | null;
  software_installed: Array<{ name: string; license_type: string; notes: string }>;
  recommendations: string | null;
  warranty_days: number;
  public_message: string | null;
  received_at: string;
  delivered_at: string | null;
  updated_at: string;
}

export interface ServiceOrderEvent {
  id: string;
  event_type: string;
  previous_status: ServiceStatus | null;
  new_status: ServiceStatus | null;
  summary: string;
  details: Record<string, unknown>;
  visibility: "internal" | "public";
  created_at: string;
}

export interface ServiceTask {
  id: string;
  description: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface ServiceOrderRevision {
  id: string;
  revision_number: number;
  snapshot: {
    diagnosis: string | null;
    backup_status: string;
    backup_details: string | null;
    software_installed: Array<{ name: string; license_type: string; notes: string }>;
    recommendations: string | null;
  };
  created_at: string;
}
