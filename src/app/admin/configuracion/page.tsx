import { saveAdminSettingsAction, saveHolidayCalendarAction } from "@/app/actions/admin-operations";
import { requireStaff } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

type AdminSettings = {
  inquiry_response_sla_hours: number;
  urgent_order_sla_hours: number;
  stale_order_hours: number;
  workday_start: string;
  workday_end: string;
  timezone: string;
  retention_clients_days: number | null;
  retention_orders_days: number | null;
  alert_email: string | null;
  daily_alerts_enabled: boolean;
};

type RetentionEntry = {
  category: string;
  retention_days: number | null;
  candidate_count: number;
  oldest_candidate: string | null;
  automatic_deletion: boolean;
};

type HolidayEntry = { holiday_date: string; name: string };

const categoryLabels: Record<string, string> = {
  clients: "Clientes archivados",
  inquiries: "Consultas",
  documents: "Documentos",
  orders: "Órdenes",
  audit_events: "Eventos de auditoría",
};

const retentionPeriods: Record<string, string> = {
  inquiries: "90 días desde cierre o resolución",
  documents: "5 años desde el envío/finalización",
  audit_events: "5 años desde la creación del evento",
};

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; holidaysSaved?: string }>;
}) {
  const { supabase, profile } = await requireStaff("settings.read");
  const [{ data: settings, error }, { data: retention, error: retentionError }, { data: runs, error: runsError }, { data: holidays, error: holidayError }, params] = await Promise.all([
    supabase.from("admin_settings").select("*").eq("id", true).single(),
    supabase.rpc("get_admin_retention_report"),
    supabase.from("admin_alert_runs").select("run_date,status,started_at,completed_at,error_code").order("run_date", { ascending: false }).limit(20),
    supabase.from("admin_holidays").select("holiday_date,name").order("holiday_date"),
    searchParams,
  ]);

  if (error) throw new Error(`No se pudo cargar la configuración: ${error.message}`);
  if (retentionError) throw new Error(`No se pudo generar el informe de retención: ${retentionError.message}`);
  if (runsError) throw new Error(`No se pudo cargar el historial de alertas: ${runsError.message}`);
  if (holidayError) throw new Error(`No se pudo cargar el calendario laboral: ${holidayError.message}`);
  const config = settings as AdminSettings;
  const mayEdit = profile.role === "admin";

  return (
    <section className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">Control del sistema</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Configuración y retención</h1>
        <p className="mt-2 max-w-3xl text-gray-400">
          Los SLA se calculan dentro del horario laboral configurado, de lunes a viernes. La retención aprobada se ejecuta diariamente en lotes protegidos y queda registrada en auditoría.
        </p>
      </header>

      {params.saved && <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-200">Configuración guardada.</p>}
      {params.holidaysSaved && <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-200">Calendario de feriados actualizado.</p>}
      {params.error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-200">
        {params.error === "hours" ? "La hora de cierre debe ser posterior a la apertura."
          : params.error === "timezone" ? "La zona horaria no es válida."
            : params.error === "holidays" ? "Revisa las fechas: usa AAAA-MM-DD, no repitas fechas y agrega hasta 40 feriados."
            : "Revisa los campos: hay valores fuera de rango o con formato inválido."}
      </p>}

      <form action={saveAdminSettingsAction} className="space-y-8">
        <fieldset disabled={!mayEdit} className="grid gap-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 disabled:opacity-70">
          <section>
            <h2 className="text-lg font-semibold text-white">SLA y horario laboral</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm text-gray-300">Consultas nuevas (horas hábiles)
                <input name="inquiry_response_sla_hours" type="number" min="1" max="720" required defaultValue={config.inquiry_response_sla_hours} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white" />
              </label>
              <label className="text-sm text-gray-300">Órdenes urgentes (horas hábiles)
                <input name="urgent_order_sla_hours" type="number" min="1" max="720" required defaultValue={config.urgent_order_sla_hours} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white" />
              </label>
              <label className="text-sm text-gray-300">Órdenes estancadas (horas hábiles)
                <input name="stale_order_hours" type="number" min="1" max="720" required defaultValue={config.stale_order_hours} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white" />
              </label>
              <label className="text-sm text-gray-300">Inicio de jornada
                <input name="workday_start" type="time" required defaultValue={config.workday_start.slice(0, 5)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white" />
              </label>
              <label className="text-sm text-gray-300">Término de jornada
                <input name="workday_end" type="time" required defaultValue={config.workday_end.slice(0, 5)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white" />
              </label>
              <label className="text-sm text-gray-300">Zona horaria IANA
                <input name="timezone" required maxLength={80} defaultValue={config.timezone} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white" />
              </label>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Plazos aprobados</h2>
            <p className="mt-1 text-sm text-gray-400">Las consultas cerradas se anonimizan después de 90 días; los documentos enviados y los eventos de auditoría vencen a los 5 años. Los plazos aprobados son fijos.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {([
                ["retention_clients_days", "Conservar clientes archivados (días)", config.retention_clients_days],
                ["retention_orders_days", "Conservar órdenes cerradas (días)", config.retention_orders_days],
              ] as const).map(([name, label, value]) => (
                <label key={name} className="text-sm text-gray-300">{label}
                  <input name={name} type="number" min="30" max="3650" defaultValue={value ?? ""} placeholder="Pendiente de aprobación" className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white" />
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500">Los plazos para clientes archivados y órdenes cerradas siguen siendo informativos y configurables; no se borran automáticamente.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Aviso diario</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-gray-300">Correo que recibirá el resumen
                <input name="alert_email" type="email" maxLength={254} defaultValue={config.alert_email ?? ""} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white" />
              </label>
              <label className="flex items-center gap-3 self-end pb-2 text-sm text-gray-300">
                <input name="daily_alerts_enabled" type="checkbox" defaultChecked={config.daily_alerts_enabled} className="size-4 accent-primary" />
                Enviar resumen cada día hábil
              </label>
            </div>
          </section>
        </fieldset>
        {mayEdit && <button className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-light">Guardar configuración</button>}
      </form>

      <form action={saveHolidayCalendarAction} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold text-white">Feriados y días no laborables</h2>
        <p className="mt-1 text-sm text-gray-400">Una fecha por línea; opcionalmente agrega una descripción después de `|`. Este calendario excluye festivos de los SLA y del resumen diario.</p>
        <textarea
          name="holidays"
          rows={8}
          disabled={!mayEdit}
          maxLength={6000}
          defaultValue={((holidays ?? []) as HolidayEntry[]).map((holiday) => `${holiday.holiday_date}${holiday.name ? ` | ${holiday.name}` : ""}`).join("\n")}
          placeholder={"2026-12-25 | Navidad\n2027-01-01 | Año Nuevo"}
          className="mt-4 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 font-mono text-sm text-white disabled:opacity-70"
        />
        {mayEdit && <button className="mt-4 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-light">Guardar feriados</button>}
      </form>

      <section className="overflow-hidden rounded-2xl border border-white/10">
        <div className="border-b border-white/10 px-6 py-4">
          <h2 className="font-semibold text-white">Candidatos de retención</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase text-gray-500"><tr>
              <th className="px-6 py-3">Módulo</th><th className="px-6 py-3">Plazo</th><th className="px-6 py-3">Candidatos</th><th className="px-6 py-3">Más antiguo</th><th className="px-6 py-3">Acción automática</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {((retention ?? []) as RetentionEntry[]).map((entry) => (
                <tr key={entry.category} className="text-gray-300">
                  <td className="px-6 py-4">{categoryLabels[entry.category] ?? entry.category}</td>
                  <td className="px-6 py-4">{retentionPeriods[entry.category] ?? (entry.retention_days ? `${entry.retention_days} días` : "Pendiente")}</td>
                  <td className="px-6 py-4">{entry.retention_days !== null ? entry.candidate_count : "—"}</td>
                  <td className="px-6 py-4">{entry.oldest_candidate ? new Date(entry.oldest_candidate).toLocaleDateString("es-CL") : "—"}</td>
                  <td className="px-6 py-4">{entry.automatic_deletion ? "Sí" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10">
        <div className="border-b border-white/10 px-6 py-4">
          <h2 className="font-semibold text-white">Ejecuciones del resumen diario</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase text-gray-500"><tr>
              <th className="px-6 py-3">Fecha</th><th className="px-6 py-3">Resultado</th><th className="px-6 py-3">Ejecutado</th><th className="px-6 py-3">Código</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {(runs ?? []).map((run) => (
                <tr key={run.run_date} className="text-gray-300">
                  <td className="px-6 py-4">{run.run_date}</td>
                  <td className="px-6 py-4">{run.status}</td>
                  <td className="px-6 py-4">{run.completed_at ? new Date(run.completed_at).toLocaleString("es-CL") : new Date(run.started_at).toLocaleString("es-CL")}</td>
                  <td className="px-6 py-4">{run.error_code ?? "—"}</td>
                </tr>
              ))}
              {(runs ?? []).length === 0 && <tr><td colSpan={4} className="px-6 py-6 text-gray-500">Aún no hay ejecuciones registradas.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
