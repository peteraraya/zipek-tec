import Link from "next/link";
import AdminSearchTable from "@/components/admin/AdminSearchTable";
import { documentTemplates } from "@/lib/admin/document-templates";
import { loadInitialAdminList } from "@/lib/admin/search";

export default async function ServiceDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const list = await loadInitialAdminList("documents", query);
  const context = new URLSearchParams();
  const clientId = typeof query.cliente === "string" ? query.cliente : "";
  const orderId = typeof query.orden === "string" ? query.orden : "";
  if (clientId) context.set("cliente", clientId);
  if (orderId) context.set("orden", orderId);
  const querySuffix = context.size ? `?${context.toString()}` : "";
  const templateLabels = Object.fromEntries(documentTemplates.map((template) => [template.id, template.title]));
  const statusLabels = { draft: "Borrador", sent: "Enviado" };

  return (
    <section>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">Operación</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Documentos de servicio</h1>
        <p className="mt-2 max-w-3xl text-gray-400">
          Busca por cliente, orden, tipo de documento o contenido. Filtra por estado, plantilla y fecha.
        </p>
      </div>

      {list.error && <p role="alert" className="mt-5 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-100">{list.error}</p>}
      <AdminSearchTable
        module="documents"
        initialData={list.data}
        initialPage={list.page}
        initialFilters={list.filters}
        preservedParams={{ cliente: clientId, orden: orderId }}
        searchPlaceholder="Cliente, orden, plantilla o contenido"
        emptyMessage="No hay documentos que coincidan con estos filtros."
        filters={[
          {
            key: "status",
            label: "Estado",
            options: Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
          },
          {
            key: "template",
            label: "Tipo de documento",
            options: documentTemplates.map((template) => ({ value: template.id, label: template.title })),
          },
        ]}
        columns={[
          { key: "template_id", label: "Documento", labels: templateLabels, hrefBase: "/admin/documentos" },
          { key: "client_name", label: "Cliente" },
          { key: "order_number", label: "Orden" },
          { key: "status", label: "Estado", labels: statusLabels },
          { key: "updated_at", label: "Actualizado", date: true },
        ]}
      />

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Crear documento</h2>
        <p className="mt-1 text-sm text-gray-400">Elige una plantilla para iniciar un nuevo borrador.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {documentTemplates.map((template) => (
            <article key={template.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-lg font-semibold text-white">{template.title}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-gray-400">{template.description}</p>
              <Link
                href={`/admin/documentos/nuevo/${template.id}${querySuffix}`}
                className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-light"
              >
                Completar documento
              </Link>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
