import Link from "next/link";
import AdminSearchTable from "@/components/admin/AdminSearchTable";
import { loadInitialAdminList } from "@/lib/admin/search";
import { serviceStatusLabels } from "@/lib/admin/types";
import { hasAdminPermission, requireStaff } from "@/lib/admin/auth";

const priorityLabels = { standard: "Normal", urgent: "Urgente" };

export default async function ServiceOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { profile } = await requireStaff("orders.read");
  const list = await loadInitialAdminList("orders", params);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">Operación</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Órdenes de servicio</h1>
          <p className="mt-2 text-gray-400">Busca órdenes, clientes o equipos y combina estado, prioridad y fechas.</p>
        </div>
        {hasAdminPermission(profile.role, "orders.manage") && (
          <Link href="/admin/ordenes/nueva" className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-light">Crear orden</Link>
        )}
      </div>
      {list.error && <p role="alert" className="mt-5 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-100">{list.error}</p>}
      <AdminSearchTable
        module="orders"
        initialData={list.data}
        initialPage={list.page}
        initialFilters={list.filters}
        searchPlaceholder="N.º de orden, cliente o equipo"
        emptyMessage="No hay órdenes que coincidan con estos filtros."
        filters={[
          {
            key: "status",
            label: "Estado",
            options: Object.entries(serviceStatusLabels).map(([value, label]) => ({ value, label })),
          },
          {
            key: "priority",
            label: "Prioridad",
            options: Object.entries(priorityLabels).map(([value, label]) => ({ value, label })),
          },
        ]}
        columns={[
          { key: "order_number", label: "Orden", hrefBase: "/admin/ordenes" },
          { key: "client_name", label: "Cliente" },
          { key: "service_type", label: "Servicio" },
          { key: "status", label: "Estado", labels: serviceStatusLabels },
          { key: "priority", label: "Prioridad", labels: priorityLabels },
          { key: "updated_at", label: "Actualizada", date: true },
        ]}
      />
    </section>
  );
}
