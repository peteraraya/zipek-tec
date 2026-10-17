import Link from "next/link";
import { getAdminOverview, getServiceOrders } from "@/lib/admin/queries";
import { serviceStatusLabels } from "@/lib/admin/types";
import { requireStaff } from "@/lib/admin/auth";

function Metric({ label, value, href }: { label: string; value: number | null; href: string }) {
  const displayValue = value === null ? "—" : value.toLocaleString("es-CL", { maximumFractionDigits: 1 });
  return (
    <Link href={href} className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-primary/40 hover:bg-white/[0.07]">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{displayValue}</p>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const { profile } = await requireStaff();
  const [overview, orders] = await Promise.all([getAdminOverview(), getServiceOrders()]);
  const recentOrders = orders.slice(0, 6);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">Panel privado</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Operación de servicios</h1>
          <p className="mt-2 text-gray-400">Clientes, órdenes de trabajo y seguimiento desde un solo lugar.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/api/admin/reports" className="rounded-lg border border-white/10 px-4 py-3 text-sm text-gray-200 hover:bg-white/5">Exportar informe</Link>
        {profile.role !== "auditor" && <>
          {(profile.role === "admin" || profile.role === "support") && (
            <Link href="/admin/clientes/nuevo" className="rounded-lg border border-white/10 px-4 py-3 text-sm text-gray-200 hover:bg-white/5">Nuevo cliente</Link>
          )}
          {(profile.role === "admin" || profile.role === "technician") && (
            <Link href="/admin/ordenes/nueva" className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-light">Nueva orden</Link>
          )}
        </>}
        </div>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Resumen de operaciones">
        <Metric label="Clientes activos" value={overview.clients} href="/admin/clientes" />
        <Metric label="Órdenes registradas" value={overview.orders} href="/admin/ordenes" />
        <Metric label="Servicios abiertos" value={overview.openOrders} href="/admin/ordenes" />
        <Metric label="Atenciones urgentes abiertas" value={overview.urgentOrders} href="/admin/ordenes" />
        <Metric label="Consultas pendientes" value={overview.openInquiries} href="/admin/consultas" />
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Alertas operativas">
        <Metric label="Consultas fuera de plazo" value={overview.overdueInquiries} href="/admin/consultas" />
        <Metric label="Órdenes urgentes fuera de plazo" value={overview.overdueUrgentOrders} href="/admin/ordenes" />
        <Metric label="Órdenes sin actualización" value={overview.staleOrders} href="/admin/ordenes" />
        <Metric label="Fallos de correo (7 días)" value={overview.failedDocumentEmails} href="/admin/configuracion" />
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="Tiempos de servicio de los últimos 90 días">
        <Metric label="Promedio hasta primera respuesta (horas hábiles, 90 días)" value={overview.averageFirstResponseHours} href="/admin/consultas" />
        <Metric label="Promedio hasta entrega (horas hábiles, 90 días)" value={overview.averageOrderCompletionHours} href="/admin/ordenes" />
      </section>

      <section className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Órdenes recientes</h2>
            <p className="mt-1 text-sm text-gray-400">Seguimiento de los últimos servicios ingresados.</p>
          </div>
          <Link href="/admin/ordenes" className="text-sm text-primary-light hover:underline">Ver todas</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-6 py-10 text-sm text-gray-400">Aún no hay órdenes de servicio.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Orden</th>
                  <th className="px-6 py-4 font-medium">Cliente</th>
                  <th className="px-6 py-4 font-medium">Servicio</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium">Actualizada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="text-gray-300">
                    <td className="px-6 py-4"><Link href={`/admin/ordenes/${order.id}`} className="font-semibold text-white hover:text-primary-light">{order.order_number}</Link></td>
                    <td className="px-6 py-4">{order.client.full_name}</td>
                    <td className="px-6 py-4">{order.service_type}</td>
                    <td className="px-6 py-4">{serviceStatusLabels[order.status]}</td>
                    <td className="px-6 py-4">{new Date(order.updated_at).toLocaleDateString("es-CL")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
