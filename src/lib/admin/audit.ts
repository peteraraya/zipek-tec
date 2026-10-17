import "server-only";

import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";

const filterSchema = z.object({
  action: z.string().trim().max(80).optional().default(""),
  entity: z.string().trim().max(80).optional().default(""),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).strict();

export type AuditFilters = z.infer<typeof filterSchema>;

export type AuditEntry = {
  id: number;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  changed_fields: string[];
  created_at: string;
  actor_name: string;
};

export function parseAuditFilters(params: URLSearchParams): AuditFilters {
  const result = filterSchema.safeParse(Object.fromEntries(params.entries()));
  if (!result.success) throw new Error("Los filtros de auditoría no son válidos.");
  for (const date of [result.data.from, result.data.to]) {
    if (
      date
      && (Number.isNaN(Date.parse(`${date}T00:00:00.000Z`))
        || new Date(`${date}T00:00:00.000Z`).toISOString().slice(0, 10) !== date)
    ) {
      throw new Error("La fecha de auditoría no es válida.");
    }
  }
  if (result.data.from && result.data.to && result.data.from > result.data.to) {
    throw new Error("La fecha inicial no puede ser posterior a la fecha final.");
  }
  return result.data;
}

export async function getAuditEntries(
  supabase: SupabaseClient,
  filters: AuditFilters,
  limit: number,
): Promise<AuditEntry[]> {
  let query = supabase
    .from("admin_audit_log")
    .select("id,actor_id,actor_name,action,entity_type,entity_id,changed_fields,created_at")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);
  if (filters.action) query = query.ilike("action", `%${filters.action.replace(/[%_\\]/g, "\\$&")}%`);
  if (filters.entity) query = query.ilike("entity_type", `%${filters.entity.replace(/[%_\\]/g, "\\$&")}%`);
  if (filters.from) query = query.gte("created_at", `${filters.from}T00:00:00.000Z`);
  if (filters.to) {
    const dayAfter = new Date(Date.parse(`${filters.to}T00:00:00.000Z`) + 24 * 60 * 60 * 1000);
    query = query.lt("created_at", dayAfter.toISOString());
  }

  const { data, error } = await query;
  if (error) throw new Error(`No se pudo cargar la auditoría: ${error.message}`);

  return (data ?? []).map((row) => ({
    ...row,
    actor_name: row.actor_name ?? (row.actor_id ? "Cuenta deshabilitada" : "Sistema"),
  })) as AuditEntry[];
}

export function toCsv(rows: string[][]) {
  const escape = (raw: string) => {
    const value = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
    return `"${value.replaceAll('"', '""')}"`;
  };
  return `\uFEFF${rows.map((row) => row.map(escape).join(",")).join("\r\n")}`;
}
