import Link from "next/link";
import AdminSearchTable from "@/components/admin/AdminSearchTable";
import { loadInitialAdminList } from "@/lib/admin/search";
import {
  serviceInquirySourceLabels,
  serviceInquiryStatusLabels,
} from "@/lib/admin/types";

export default async function ServiceInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const list = await loadInitialAdminList("inquiries", await searchParams);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">Atención</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Consultas</h1>
          <p className="mt-2 text-gray-400">Busca por referencia, tema, mensaje o contacto autorizado.</p>
        </div>
        <Link href="/admin/consultas/nueva" className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-light">
          Registrar WhatsApp
        </Link>
      </div>
      {list.error && <p role="alert" className="mt-5 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-100">{list.error}</p>}
      <AdminSearchTable
        module="inquiries"
        initialData={list.data}
        initialPage={list.page}
        initialFilters={list.filters}
        searchPlaceholder="N.º, tema, mensaje o contacto autorizado"
        emptyMessage="No hay consultas que coincidan con estos filtros."
        filters={[
          {
            key: "status",
            label: "Estado",
            options: Object.entries(serviceInquiryStatusLabels).map(([value, label]) => ({ value, label })),
          },
          {
            key: "source",
            label: "Canal",
            options: Object.entries(serviceInquirySourceLabels).map(([value, label]) => ({ value, label })),
          },
        ]}
        columns={[
          { key: "inquiry_number", label: "Referencia", hrefBase: "/admin/consultas" },
          { key: "topic", label: "Tema" },
          { key: "source", label: "Canal", labels: serviceInquirySourceLabels },
          { key: "contact_display", label: "Contacto autorizado" },
          { key: "status", label: "Estado", labels: serviceInquiryStatusLabels },
          { key: "updated_at", label: "Actualizada", date: true },
        ]}
      />
    </section>
  );
}
