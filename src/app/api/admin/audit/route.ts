import { getAuditEntries, parseAuditFilters, toCsv } from "@/lib/admin/audit";
import { requireStaff } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { supabase } = await requireStaff("audit.read");
  let filters;
  try {
    filters = parseAuditFilters(new URL(request.url).searchParams);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Los filtros no son válidos." }, { status: 400 });
  }

  const { error: auditError } = await supabase.rpc("record_admin_audit", {
    p_action: "export",
    p_entity_type: "admin_audit_log",
    p_entity_id: null,
    p_changed_fields: [],
  });
  if (auditError) throw new Error(`No se pudo registrar la exportación: ${auditError.message}`);

  const entries = await getAuditEntries(supabase, filters, 5000);
  const csv = toCsv([
    ["fecha", "actor", "accion", "modulo", "registro", "campos"],
    ...entries.map((entry) => [
      entry.created_at,
      entry.actor_name,
      entry.action,
      entry.entity_type,
      entry.entity_id ?? "",
      entry.changed_fields.join(" | "),
    ]),
  ]);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="auditoria-zipek.csv"',
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
