import Link from "next/link";
import { getServiceOrders } from "@/lib/admin/queries";
import { serviceStatusLabels } from "@/lib/admin/types";

export default async function ServiceOrdersPage() {
  const orders = await getServiceOrders();

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">Operación</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Órdenes de servicio</h1>
          <p className="mt-2 text-gray-400">Historial de trabajos, estados y acceso a documentos de servicio.</p>
        </div>
        <Link href="/admin/ordenes/nueva" className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-light">Crear orden</Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-6 py-4 font-medium">Orden</th>
              <th className="px-6 py-4 font-medium">Cliente</th>
              <th className="px-6 py-4 font-medium">Servicio</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4 font-medium">Prioridad</th>
              <th className="px-6 py-4 font-medium">Actualizada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((order) => (
              <tr key={order.id} className="text-gray-300">
                <td className="px-6 py-4"><Link href={`/admin/ordenes/${order.id}`} className="font-semibold text-white hover:text-primary-light">{order.order_number}</Link></td>
                <td className="px-6 py-4">{order.client.full_name}</td>
                <td className="px-6 py-4">{order.service_type}</td>
                <td className="px-6 py-4">{serviceStatusLabels[order.status]}</td>
                <td className="px-6 py-4">{order.priority === "urgent" ? <span className="text-amber-300">Urgente</span> : "Normal"}</td>
                <td className="px-6 py-4">{new Date(order.updated_at).toLocaleDateString("es-CL")}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Todavía no hay órdenes de servicio registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {orders.length === 200 && <p className="mt-3 text-xs text-gray-500">Se muestran las 200 órdenes más recientes.</p>}
    </section>
  );
}
