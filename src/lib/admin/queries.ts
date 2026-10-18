import "server-only";

import { requireStaff } from "@/lib/admin/auth";
import type {
  ClientRecord,
  ServiceInquiryEvent,
  ServiceInquiryRecord,
  ServiceOrderEvent,
  ServiceOrderRecord,
  ServiceOrderRevision,
  ServiceDocumentRecord,
  ServiceTask,
} from "@/lib/admin/types";

export class AdminRecordNotFoundError extends Error {
  constructor(entity: string) {
    super(`${entity} no existe.`);
    this.name = "AdminRecordNotFoundError";
  }
}

export async function getAdminOverview() {
  const { supabase } = await requireStaff("reports.read");
  const { data, error } = await supabase.rpc("get_admin_operational_metrics");
  if (error) throw new Error(`No se pudo cargar el resumen administrativo: ${error.message}`);
  if (!data || typeof data !== "object") throw new Error("La base de datos devolvió métricas inválidas.");

  const metrics = data as Record<string, unknown>;
  const readCount = (key: string) => {
    const value = metrics[key];
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
      throw new Error(`La métrica administrativa "${key}" no es válida.`);
    }
    return value;
  };
  const readAverage = (key: string) => {
    const value = metrics[key];
    if (value === null) return null;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new Error(`La métrica administrativa "${key}" no es válida.`);
    }
    return value;
  };

  return {
    clients: readCount("active_clients"),
    orders: readCount("total_orders"),
    openOrders: readCount("open_orders"),
    urgentOrders: readCount("urgent_open_orders"),
    openInquiries: readCount("open_inquiries"),
    overdueInquiries: readCount("overdue_inquiries"),
    overdueUrgentOrders: readCount("overdue_urgent_orders"),
    staleOrders: readCount("stale_orders"),
    failedDocumentEmails: readCount("failed_document_emails_7d"),
    averageFirstResponseHours: readAverage("avg_first_response_business_hours_90d"),
    averageOrderCompletionHours: readAverage("avg_order_completion_business_hours_90d"),
  };
}

export async function getServiceInquiries(): Promise<ServiceInquiryRecord[]> {
  const { supabase } = await requireStaff();
  const { data, error } = await supabase
    .from("service_inquiries")
    .select("id, inquiry_number, source, status, topic, contact_name, contact_phone, contact_email, contact_consent, request_details, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(`No se pudieron cargar las consultas: ${error.message}`);
  return (data ?? []) as ServiceInquiryRecord[];
}

export async function getServiceInquiry(id: string): Promise<{
  inquiry: ServiceInquiryRecord;
  events: ServiceInquiryEvent[];
}> {
  const { supabase } = await requireStaff();
  const [inquiryResult, eventsResult] = await Promise.all([
    supabase
      .from("service_inquiries")
      .select("id, inquiry_number, source, status, topic, message, contact_name, contact_phone, contact_email, contact_consent, request_details, created_at, updated_at")
      .eq("id", id)
      .single(),
    supabase
      .from("service_inquiry_events")
      .select("id, event_type, previous_status, new_status, summary, created_at")
      .eq("inquiry_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (inquiryResult.error?.code === "PGRST116") {
    throw new AdminRecordNotFoundError("La consulta");
  }
  if (inquiryResult.error) {
    throw new Error(`No se pudo cargar la consulta: ${inquiryResult.error.message}`);
  }
  if (eventsResult.error) {
    throw new Error(`No se pudo cargar el historial de la consulta: ${eventsResult.error.message}`);
  }

  return {
    inquiry: inquiryResult.data as ServiceInquiryRecord,
    events: (eventsResult.data ?? []) as ServiceInquiryEvent[],
  };
}

export async function getClients(includeArchived = false): Promise<ClientRecord[]> {
  const { supabase } = await requireStaff();
  let query = supabase
    .from("clients")
    .select("id, full_name, rut, phone, email, address, notes, archived_at, created_at")
    .order("full_name");

  if (!includeArchived) query = query.is("archived_at", null);
  const { data, error } = await query;
  if (error) throw new Error(`No se pudieron cargar los clientes: ${error.message}`);
  return (data ?? []) as ClientRecord[];
}

export async function getClient(id: string): Promise<ClientRecord> {
  const { supabase } = await requireStaff();
  const { data, error } = await supabase
    .from("clients")
    .select("id, full_name, rut, phone, email, address, notes, archived_at, created_at")
    .eq("id", id)
    .single();

  if (error?.code === "PGRST116") throw new AdminRecordNotFoundError("El cliente");
  if (error) throw new Error(`No se pudo cargar el cliente: ${error.message}`);
  return data as ClientRecord;
}

export async function getServiceOrders(): Promise<
  Array<ServiceOrderRecord & { client: Pick<ClientRecord, "full_name" | "phone"> }>
> {
  const { supabase } = await requireStaff();
  const { data, error } = await supabase
    .from("service_orders")
    .select("*, client:clients!inner(full_name, phone)")
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(`No se pudieron cargar las órdenes: ${error.message}`);
  return (data ?? []) as Array<
    ServiceOrderRecord & { client: Pick<ClientRecord, "full_name" | "phone"> }
  >;
}

export async function getServiceOrder(id: string): Promise<{
  order: ServiceOrderRecord;
  client: ClientRecord;
  events: ServiceOrderEvent[];
  tasks: ServiceTask[];
  revisions: ServiceOrderRevision[];
}> {
  const { supabase } = await requireStaff();
  const [orderResult, eventsResult, tasksResult, revisionsResult] = await Promise.all([
    supabase.from("service_orders").select("*").eq("id", id).single(),
    supabase
      .from("service_order_events")
      .select("id, event_type, previous_status, new_status, summary, details, visibility, created_at")
      .eq("order_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("service_tasks")
      .select("id, description, completed, completed_at, created_at")
      .eq("order_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("service_order_revisions")
      .select("id, revision_number, snapshot, created_at")
      .eq("order_id", id)
      .order("revision_number", { ascending: false }),
  ]);

  if (orderResult.error?.code === "PGRST116") throw new AdminRecordNotFoundError("La orden");
  if (orderResult.error) throw new Error(`No se pudo cargar la orden: ${orderResult.error.message}`);
  if (eventsResult.error) throw new Error(`No se pudo cargar el historial: ${eventsResult.error.message}`);
  if (tasksResult.error) throw new Error(`No se pudieron cargar las tareas: ${tasksResult.error.message}`);
  if (revisionsResult.error) throw new Error(`No se pudieron cargar las revisiones: ${revisionsResult.error.message}`);

  const order = orderResult.data as ServiceOrderRecord;
  const client = await getClient(order.client_id);
  return {
    order,
    client,
    events: (eventsResult.data ?? []) as ServiceOrderEvent[],
    tasks: (tasksResult.data ?? []) as ServiceTask[],
    revisions: (revisionsResult.data ?? []) as ServiceOrderRevision[],
  };
}

export async function getServiceDocuments(): Promise<ServiceDocumentRecord[]> {
  const { supabase } = await requireStaff();
  const { data, error } = await supabase
    .from("service_documents")
    .select("*, client:clients!service_documents_client_id_fkey(full_name)")
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(`No se pudieron cargar los documentos: ${error.message}`);
  return (data ?? []) as ServiceDocumentRecord[];
}

export async function getServiceDocument(id: string): Promise<{
  document: ServiceDocumentRecord;
  client: ClientRecord;
}> {
  const { supabase } = await requireStaff();
  const { data, error } = await supabase
    .from("service_documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error?.code === "PGRST116") throw new AdminRecordNotFoundError("El documento");
  if (error) throw new Error(`No se pudo cargar el documento: ${error.message}`);
  const document = data as ServiceDocumentRecord;
  const client = await getClient(document.client_id);
  return { document, client };
}
