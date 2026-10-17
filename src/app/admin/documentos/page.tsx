import Link from "next/link";
import { documentTemplates } from "@/lib/admin/document-templates";
import { getServiceDocuments } from "@/lib/admin/queries";

export default async function ServiceDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; orden?: string }>;
}) {
  const query = await searchParams;
  const documents = await getServiceDocuments();
  const context = new URLSearchParams();
  if (query.cliente) context.set("cliente", query.cliente);
  if (query.orden) context.set("orden", query.orden);
  const querySuffix = context.size ? `?${context.toString()}` : "";

  return (
    <section>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">Operación</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Documentos de servicio</h1>
        <p className="mt-2 max-w-3xl text-gray-400">
          Completa los documentos para cada atención, guarda borradores, envíalos por correo o imprímelos / guárdalos como PDF.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {documentTemplates.map((template) => (
          <article key={template.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-lg font-semibold text-white">{template.title}</h2>
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

      <section className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="text-lg font-semibold text-white">Borradores y documentos enviados</h2>
          <p className="mt-1 text-sm text-gray-400">Los documentos guardados están asociados a un cliente y, opcionalmente, a una orden.</p>
        </div>
        {documents.length === 0 ? (
          <p className="px-6 py-10 text-sm text-gray-400">Todavía no hay documentos guardados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Documento</th>
                  <th className="px-6 py-4 font-medium">Cliente</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium">Actualizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {documents.map((document) => {
                  const template = documentTemplates.find((item) => item.id === document.template_id);
                  return (
                    <tr key={document.id} className="text-gray-300">
                      <td className="px-6 py-4">
                        <Link href={`/admin/documentos/${document.id}`} className="font-semibold text-white hover:text-primary-light">
                          {template?.title ?? "Documento"}
                        </Link>
                      </td>
                      <td className="px-6 py-4">{document.client?.full_name ?? "Cliente"}</td>
                      <td className="px-6 py-4">
                        {document.status === "sent"
                          ? `Enviado a ${document.sent_to}`
                          : "Borrador"}
                      </td>
                      <td className="px-6 py-4">{new Date(document.updated_at).toLocaleDateString("es-CL")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {documents.length === 200 && <p className="px-6 pb-4 text-xs text-gray-500">Se muestran los 200 documentos más recientes.</p>}
      </section>
    </section>
  );
}
