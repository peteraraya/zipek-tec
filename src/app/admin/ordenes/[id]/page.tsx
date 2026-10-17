import Link from "next/link";
import { notFound } from "next/navigation";
import ReportEditor from "@/components/admin/ReportEditor";
import StatusUpdateForm from "@/components/admin/StatusUpdateForm";
import TaskLogForm from "@/components/admin/TaskLogForm";
import TrackingLinkManager from "@/components/admin/TrackingLinkManager";
import { serviceStatusLabels } from "@/lib/admin/types";
import { AdminRecordNotFoundError, getServiceOrder } from "@/lib/admin/queries";

export default async function ServiceOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reportUpdated?: string; error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  let record;
  try {
    record = await getServiceOrder(id);
  } catch (error) {
    if (error instanceof AdminRecordNotFoundError) notFound();
    throw error;
  }
  const { order, client, events, tasks, revisions } = record;

  return (
    <section>
      <Link href="/admin/ordenes" className="text-sm text-gray-400 hover:text-white">← Órdenes</Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">{order.order_number}</p>
          <h1 className="mt-2 text-3xl font-bold text-white">{order.service_type}</h1>
          <p className="mt-2 text-gray-400">{client.full_name} · {client.phone}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/admin/ordenes/${id}/documentos`} className="rounded-lg border border-white/10 px-4 py-3 text-sm text-gray-200 hover:bg-white/5">Orden e informe imprimibles</Link>
          <Link href={`/admin/documentos?cliente=${client.id}&orden=${order.id}`} className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-light">Generar documento</Link>
        </div>
      </div>

      {query.error && <p role="alert" className="mt-5 rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{query.error}</p>}
      {query.reportUpdated && <p className="mt-5 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-200">Informe guardado en el historial.</p>}

      <div className="mt-8">
        <TrackingLinkManager orderId={order.id} orderNumber={order.order_number} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-400">Estado actual</p>
                <h2 className="mt-1 text-xl font-semibold text-white">{serviceStatusLabels[order.status]}</h2>
              </div>
              {order.priority === "urgent" && <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">Atención urgente</span>}
            </div>
            <div className="mt-6 border-t border-white/10 pt-5">
              <StatusUpdateForm order={order} />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold text-white">Datos de recepción y autorización</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div><dt className="text-xs uppercase tracking-wide text-gray-500">Problema reportado</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-gray-200">{order.reported_problem}</dd></div>
              <div><dt className="text-xs uppercase tracking-wide text-gray-500">Trabajo autorizado</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-gray-200">{order.authorized_work}</dd></div>
              <div><dt className="text-xs uppercase tracking-wide text-gray-500">Equipo</dt><dd className="mt-1 text-sm text-gray-200">{[order.equipment_brand, order.equipment_model].filter(Boolean).join(" ") || "No especificado"}</dd></div>
              <div><dt className="text-xs uppercase tracking-wide text-gray-500">Número de serie</dt><dd className="mt-1 text-sm text-gray-200">{order.equipment_serial || "No especificado"}</dd></div>
              <div><dt className="text-xs uppercase tracking-wide text-gray-500">Precio cerrado</dt><dd className="mt-1 text-sm text-gray-200">{order.quoted_amount == null ? "Por definir" : `$${Number(order.quoted_amount).toLocaleString("es-CL")} CLP`}</dd></div>
              <div><dt className="text-xs uppercase tracking-wide text-gray-500">Respaldo al ingreso</dt><dd className="mt-1 text-sm text-gray-200">{order.backup_status}</dd></div>
            </dl>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold text-white">Informe de servicio · Anexo B</h2>
            <p className="mt-1 text-sm text-gray-400">Los cambios del informe se registran en el historial interno.</p>
            <div className="mt-5"><ReportEditor order={order} /></div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold text-white">Registro de trabajos realizados</h2>
            <div className="mt-5"><TaskLogForm orderId={order.id} /></div>
            <ul className="mt-6 divide-y divide-white/5">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-start justify-between gap-4 py-3 text-sm">
                  <span className="text-gray-200">{task.description}</span>
                  <span className={task.completed ? "shrink-0 text-emerald-300" : "shrink-0 text-amber-200"}>{task.completed ? "Completada" : "Pendiente"}</span>
                </li>
              ))}
              {tasks.length === 0 && <li className="py-4 text-sm text-gray-500">Aún no hay tareas registradas.</li>}
            </ul>
          </section>
        </div>

        <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold text-white">Historial y revisiones</h2>
          <ol className="mt-6 space-y-5">
            {events.map((event) => (
              <li key={event.id} className="relative border-l border-white/10 pl-5">
                <span className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-primary-light" />
                <p className="text-sm font-medium text-gray-100">{event.summary}</p>
                <p className="mt-1 text-xs text-gray-500">{new Date(event.created_at).toLocaleString("es-CL")}</p>
                <p className="mt-1 text-xs text-gray-500">{event.visibility === "public" ? "Visible al cliente" : "Nota interna"}</p>
              </li>
            ))}
          </ol>
          <h3 className="mt-8 border-t border-white/10 pt-6 text-sm font-semibold text-gray-200">Versiones del informe</h3>
          <ol className="mt-4 space-y-3">
            {revisions.map((revision) => (
              <li key={revision.id} className="rounded-lg border border-white/5 bg-black/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-100">Revisión {revision.revision_number}</p>
                  <p className="text-xs text-gray-500">{new Date(revision.created_at).toLocaleString("es-CL")}</p>
                </div>
                <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-xs text-gray-400">{revision.snapshot.diagnosis || "Diagnóstico aún no registrado"}</p>
                <p className="mt-1 text-xs text-gray-500">Respaldo: {revision.snapshot.backup_status} · Programas: {revision.snapshot.software_installed?.length ?? 0}</p>
                <details className="mt-3 text-xs text-gray-400">
                  <summary className="cursor-pointer text-primary-light">Ver contenido de esta revisión</summary>
                  <div className="mt-3 space-y-2 whitespace-pre-wrap">
                    <p><strong>Diagnóstico:</strong> {revision.snapshot.diagnosis || "Sin registro"}</p>
                    <p><strong>Respaldo:</strong> {revision.snapshot.backup_status} · {revision.snapshot.backup_details || "Sin detalle"}</p>
                    <p><strong>Recomendaciones:</strong> {revision.snapshot.recommendations || "Sin recomendaciones"}</p>
                    <p><strong>Software:</strong> {revision.snapshot.software_installed?.map((item) => `${item.name} (${item.license_type})${item.notes ? `: ${item.notes}` : ""}`).join("; ") || "Ninguno registrado"}</p>
                  </div>
                </details>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
}
