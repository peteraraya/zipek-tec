import "server-only";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { documentTemplates } from "@/lib/admin/document-templates";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().transform((value) => value || null);
const commonFields = {
  q: z.string().trim().max(120).optional().default(""),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
  cursor: z.string().max(200).optional(),
  from: dateSchema,
  to: dateSchema,
};

const clientParams = z.object({
  ...commonFields,
  archived: z.enum(["active", "archived", "all"]).optional().default("active"),
}).strict();

const orderParams = z.object({
  ...commonFields,
  status: z.enum(["received", "diagnosis", "awaiting_approval", "in_progress", "ready", "delivered", "cancelled"]).optional(),
  priority: z.enum(["standard", "urgent"]).optional(),
}).strict();

const documentParams = z.object({
  ...commonFields,
  status: z.enum(["draft", "sent"]).optional(),
  template: z.enum(documentTemplates.map((item) => item.id) as [string, ...string[]]).optional(),
}).strict();

const inquiryParams = z.object({
  ...commonFields,
  status: z.enum(["new", "in_progress", "waiting_customer", "resolved", "closed"]).optional(),
  source: z.enum(["web", "whatsapp"]).optional(),
}).strict();

export type AdminListModule = "clients" | "orders" | "documents" | "inquiries";
export type AdminListResult = {
  data: Array<Record<string, unknown>>;
  page: { limit: number; nextCursor: string | null; hasMore: boolean };
};

const listFilterKeys: Record<AdminListModule, string[]> = {
  clients: ["q", "limit", "cursor", "from", "to", "archived"],
  orders: ["q", "limit", "cursor", "from", "to", "status", "priority"],
  documents: ["q", "limit", "cursor", "from", "to", "status", "template"],
  inquiries: ["q", "limit", "cursor", "from", "to", "status", "source"],
};

export async function loadInitialAdminList(
  module: AdminListModule,
  incoming: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  for (const key of listFilterKeys[module]) {
    const value = incoming[key];
    if (typeof value === "string" && value) params.set(key, value);
  }

  try {
    return {
      ...(await searchAdminList(module, params)),
      filters: Object.fromEntries(params.entries()),
      error: "",
    };
  } catch (error) {
    if (!(error instanceof AdminSearchValidationError)) throw error;
    const fallback = await searchAdminList(module, new URLSearchParams());
    return {
      ...fallback,
      filters: {},
      error: error.message,
    };
  }
}

function escapeLikeQuery(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function decodeCursor(cursor?: string) {
  if (!cursor) return { updatedAt: null, id: null };

  let decoded: string;
  try {
    decoded = Buffer.from(cursor, "base64url").toString("utf8");
  } catch {
    throw new AdminSearchValidationError("El cursor de paginación no es válido.");
  }
  const separator = decoded.lastIndexOf("|");
  const updatedAt = decoded.slice(0, separator);
  const id = decoded.slice(separator + 1);
  if (
    separator < 1
    || Number.isNaN(Date.parse(updatedAt))
    || !uuidPattern.test(id)
  ) {
    throw new AdminSearchValidationError("El cursor de paginación no es válido.");
  }
  return { updatedAt, id };
}

function encodeCursor(row: Record<string, unknown>) {
  const updatedAt = row.updated_at;
  const id = row.id;
  if (typeof updatedAt !== "string" || typeof id !== "string" || !uuidPattern.test(id)) {
    throw new Error("La base de datos devolvió un cursor de paginación inválido.");
  }
  return Buffer.from(`${updatedAt}|${id}`).toString("base64url");
}

function validateDateRange(from: string | null, to: string | null) {
  if (from && Number.isNaN(Date.parse(`${from}T00:00:00Z`))) {
    throw new AdminSearchValidationError("La fecha inicial no es válida.");
  }
  if (to && Number.isNaN(Date.parse(`${to}T00:00:00Z`))) {
    throw new AdminSearchValidationError("La fecha final no es válida.");
  }
  if (from && to && from > to) {
    throw new AdminSearchValidationError("La fecha inicial no puede ser posterior a la fecha final.");
  }
}

async function authenticatedSearchClient() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (
    userError
    && userError.name !== "AuthSessionMissingError"
    && userError.status !== 401
  ) {
    throw new Error(`No se pudo verificar la sesión administrativa: ${userError.message}`);
  }
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("admin_profiles")
    .select("active")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error(`No se pudo verificar el acceso administrativo: ${error.message}`);
  return profile?.active ? supabase : null;
}

function parseParams(module: AdminListModule, params: URLSearchParams) {
  const values = Object.fromEntries(params.entries());
  const result = module === "clients"
    ? clientParams.safeParse(values)
    : module === "orders"
      ? orderParams.safeParse(values)
      : module === "documents"
        ? documentParams.safeParse(values)
        : inquiryParams.safeParse(values);

  if (!result.success) {
    throw new AdminSearchValidationError(result.error.issues[0]?.message ?? "Los filtros no son válidos.");
  }
  const { from, to, q, ...parsedFilters } = result.data;
  validateDateRange(from, to);
  if (q.length === 1) throw new AdminSearchValidationError("Escribe al menos 2 caracteres para buscar.");
  return {
    limit: parsedFilters.limit,
    cursor: parsedFilters.cursor,
    archived: "archived" in parsedFilters ? parsedFilters.archived : "active",
    status: "status" in parsedFilters ? parsedFilters.status ?? null : null,
    priority: "priority" in parsedFilters ? parsedFilters.priority ?? null : null,
    template: "template" in parsedFilters ? parsedFilters.template ?? null : null,
    source: "source" in parsedFilters ? parsedFilters.source ?? null : null,
    q: escapeLikeQuery(q),
    from,
    to,
  };
}

export async function searchAdminList(module: AdminListModule, searchParams: URLSearchParams): Promise<AdminListResult> {
  const filters = parseParams(module, searchParams);
  const cursor = decodeCursor(filters.cursor);
  const supabase = await authenticatedSearchClient();
  if (!supabase) {
    throw new AdminSearchUnauthorizedError();
  }

  const common = {
    p_query: filters.q,
    p_from: filters.from,
    p_to: filters.to,
    p_before_updated_at: cursor.updatedAt,
    p_before_id: cursor.id,
    p_limit: filters.limit + 1,
  };

  let data: unknown[] | null;
  let error: { message: string } | null;
  switch (module) {
    case "clients": {
      const result = await supabase.rpc("search_admin_clients", {
        ...common,
        p_archived: filters.archived,
      });
      data = result.data;
      error = result.error;
      break;
    }
    case "orders": {
      const result = await supabase.rpc("search_admin_orders", {
        ...common,
        p_status: filters.status ?? null,
        p_priority: filters.priority ?? null,
      });
      data = result.data;
      error = result.error;
      break;
    }
    case "documents": {
      const result = await supabase.rpc("search_admin_documents", {
        ...common,
        p_status: filters.status ?? null,
        p_template: filters.template ?? null,
      });
      data = result.data;
      error = result.error;
      break;
    }
    case "inquiries": {
      const result = await supabase.rpc("search_admin_inquiries", {
        ...common,
        p_status: filters.status ?? null,
        p_source: filters.source ?? null,
      });
      data = result.data;
      error = result.error;
      break;
    }
  }
  if (error) throw new Error(`No se pudo buscar ${module}: ${error.message}`);

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  const hasMore = rows.length > filters.limit;
  if (hasMore) rows.pop();
  return {
    data: rows,
    page: {
      limit: filters.limit,
      hasMore,
      nextCursor: hasMore && rows.length > 0 ? encodeCursor(rows[rows.length - 1]) : null,
    },
  };
}

export class AdminSearchUnauthorizedError extends Error {
  constructor() {
    super("Se requiere una sesión administrativa activa.");
    this.name = "AdminSearchUnauthorizedError";
  }
}

export class AdminSearchValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminSearchValidationError";
  }
}
