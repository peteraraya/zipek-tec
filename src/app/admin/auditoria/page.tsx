import { getAuditEntries, parseAuditFilters } from "@/lib/admin/audit";
import { requireStaff } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabase } = await requireStaff("audit.read");
  const incoming = await searchParams;
  const params = new URLSearchParams();
  for (const key of ["action", "entity", "from", "to"]) {
    const value = incoming[key];
    if (typeof value === "string") params.set(key, value);
  }
  const filters = parseAuditFilters(params);
  const entries = await getAuditEntries(supabase, filters, 200);
  const exportQuery = params.toString();

  return (
    <section>
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">Trazabilidad</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Auditoría</h1>
        <p className="mt-2 text-gray-400">Registro append-only de cambios. Se guardan nombres de campos modificados, no valores personales.</p>
      </header>

      <form className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:grid-cols-5">
        <label className="text-sm text-gray-300">Acción
          <input name="action" defaultValue={filters.action} maxLength={80} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white" />
        </label>
        <label className="text-sm text-gray-300">Módulo
          <input name="entity" defaultValue={filters.entity} maxLength={80} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white" />
        </label>
        <label className="text-sm text-gray-300">Desde
          <input name="from" type="date" defaultValue={filters.from} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white" />
        </label>
        <label className="text-sm text-gray-300">Hasta
          <input name="to" type="date" defaultValue={filters.to} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white" />
        </label>
        <div className="flex items-end gap-2">
          <button className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">Filtrar</button>
          <a href={`/api/admin/audit?${exportQuery}`} className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5">CSV</a>
        </div>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase text-gray-500"><tr>
            <th className="px-5 py-4">Fecha</th><th className="px-5 py-4">Actor</th><th className="px-5 py-4">Acción</th><th className="px-5 py-4">Módulo</th><th className="px-5 py-4">Registro</th><th className="px-5 py-4">Campos</th>
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {entries.map((entry) => (
              <tr key={entry.id} className="text-gray-300">
                <td className="px-5 py-4 whitespace-nowrap">{new Date(entry.created_at).toLocaleString("es-CL")}</td>
                <td className="px-5 py-4">{entry.actor_name}</td>
                <td className="px-5 py-4">{entry.action}</td>
                <td className="px-5 py-4">{entry.entity_type}</td>
                <td className="px-5 py-4 font-mono text-xs">{entry.entity_id ?? "—"}</td>
                <td className="px-5 py-4">{entry.changed_fields.join(", ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && <p className="px-5 py-8 text-sm text-gray-400">No hay eventos para estos filtros.</p>}
      </div>
      <p className="mt-3 text-sm text-gray-500">Se muestran hasta 200 eventos. El CSV incluye hasta 5.000 registros.</p>
    </section>
  );
}
