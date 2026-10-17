import { requireStaff } from "@/lib/admin/auth";
import { toCsv } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const { supabase } = await requireStaff("reports.read");
  const { data: metrics, error: metricsError } = await supabase.rpc("get_admin_operational_metrics");
  if (metricsError) throw new Error(`No se pudo generar el informe operativo: ${metricsError.message}`);
  const { data: retention, error: retentionError } = await supabase.rpc("get_admin_retention_report");
  if (retentionError) throw new Error(`No se pudo cargar el informe de retención: ${retentionError.message}`);

  const { error: auditError } = await supabase.rpc("record_admin_audit", {
    p_action: "export",
    p_entity_type: "admin_operational_report",
    p_entity_id: null,
    p_changed_fields: [],
  });
  if (auditError) throw new Error(`No se pudo registrar la exportación: ${auditError.message}`);

  const values = metrics as Record<string, unknown>;
  const rows = [
    ["tipo", "indicador", "valor", "plazo_dias", "candidatos", "mas_antiguo"],
    ...Object.entries(values).map(([key, value]) => ["operacion", key, value == null ? "" : String(value), "", "", ""]),
    ...((retention ?? []) as Array<Record<string, unknown>>).map((entry) => [
      "retencion",
      String(entry.category),
      "",
      entry.retention_days === null ? "" : String(entry.retention_days),
      String(entry.candidate_count),
      entry.oldest_candidate ? String(entry.oldest_candidate) : "",
    ]),
  ];

  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="informe-operativo-zipek.csv"',
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
