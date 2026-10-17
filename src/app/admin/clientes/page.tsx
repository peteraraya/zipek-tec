import Link from "next/link";
import AdminSearchTable from "@/components/admin/AdminSearchTable";
import { loadInitialAdminList } from "@/lib/admin/search";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const list = await loadInitialAdminList("clients", params);
  const initialFilters = { archived: "active", ...list.filters };

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">Directorio</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Clientes</h1>
          <p className="mt-2 text-gray-400">Busca por nombre, RUT, teléfono o correo y filtra el directorio.</p>
        </div>
        <Link href="/admin/clientes/nuevo" className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-light">Registrar cliente</Link>
      </div>

      {params.created && <p className="mt-5 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-200">Cliente registrado.</p>}
      {params.updated && <p className="mt-5 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-200">Datos del cliente actualizados.</p>}
      {params.error && <p role="alert" className="mt-5 rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{params.error}</p>}
      {list.error && <p role="alert" className="mt-5 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-100">{list.error}</p>}

      <AdminSearchTable
        module="clients"
        initialData={list.data}
        initialPage={list.page}
        initialFilters={initialFilters}
        searchPlaceholder="Nombre, RUT, teléfono o correo"
        emptyMessage="No hay clientes que coincidan con estos filtros."
        filters={[{
          key: "archived",
          label: "Estado del cliente",
          includeAllOption: false,
          options: [
            { value: "active", label: "Activos" },
            { value: "archived", label: "Archivados" },
            { value: "all", label: "Todos" },
          ],
        }]}
        columns={[
          { key: "full_name", label: "Nombre", hrefBase: "/admin/clientes" },
          { key: "phone", label: "Teléfono" },
          { key: "email", label: "Correo" },
          { key: "rut", label: "RUT" },
          { key: "is_archived", label: "Estado", labels: { true: "Archivado", false: "Activo" } },
          { key: "updated_at", label: "Actualizado", date: true },
        ]}
      />
    </section>
  );
}
