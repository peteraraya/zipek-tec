import Link from "next/link";
import { notFound } from "next/navigation";
import DocumentEmailForm from "@/components/admin/DocumentEmailForm";
import PrintButton from "@/components/admin/PrintButton";
import { siteConfig } from "@/config/site";
import { AdminRecordNotFoundError, getServiceDocument, getServiceOrder } from "@/lib/admin/queries";
import { getDocumentTemplate } from "@/lib/admin/document-templates";

export default async function ServiceDocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let record;
  try {
    record = await getServiceDocument(id);
  } catch (error) {
    if (error instanceof AdminRecordNotFoundError) notFound();
    throw error;
  }

  const template = getDocumentTemplate(record.document.template_id);
  if (!template) notFound();
  const associatedOrder = record.document.order_id
    ? await getServiceOrder(record.document.order_id)
    : null;

  return (
    <main className="mx-auto max-w-4xl">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link href="/admin/documentos" className="text-sm text-gray-400 hover:text-white">← Documentos</Link>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/admin/documentos/${id}/editar`}
            className="rounded-lg border border-white/10 px-4 py-3 text-sm text-gray-200 hover:bg-white/5"
          >
            Editar documento
          </Link>
          <a
            href={`/admin/documentos/${id}/pdf`}
            className="rounded-lg border border-white/10 px-4 py-3 text-sm text-gray-200 hover:bg-white/5"
          >
            Descargar PDF
          </a>
          <PrintButton />
        </div>
      </div>

      <div className="no-print mb-6 grid gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:grid-cols-2">
        <div>
          <h1 className="text-xl font-semibold text-white">Entrega digital</h1>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            El correo incluye el documento y un PDF adjunto. También puedes descargar el PDF o imprimir solo el documento.
          </p>
          <p className="mt-3 text-xs text-gray-500">
            {record.document.status === "sent"
              ? `Enviado a ${record.document.sent_to} el ${new Date(record.document.sent_at ?? "").toLocaleString("es-CL")}.`
              : "Aún no se ha enviado por correo."}
          </p>
        </div>
        <DocumentEmailForm
          documentId={id}
          defaultEmail={record.client.email ?? ""}
        />
      </div>

      <article className="print-only-document print-document rounded-xl bg-white p-8 text-gray-900 shadow-xl print:rounded-none print:p-10 print:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-5 border-b border-gray-300 pb-5">
          <div>
            <p className="text-2xl font-bold uppercase tracking-wide">{siteConfig.name}</p>
            <p className="mt-1 text-sm">RUT 76.850.804-6 · {siteConfig.contact.city}, {siteConfig.contact.region}</p>
            <p className="mt-1 text-sm">WhatsApp {siteConfig.contact.phone} · {siteConfig.contact.email}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">{template.title.toLocaleUpperCase("es-CL")}</p>
            <p className="mt-2">Cliente: {record.client.full_name}</p>
            <p>{associatedOrder ? `Orden ${associatedOrder.order.order_number}` : "Sin orden asociada"}</p>
            <p>Fecha de creación: {new Date(record.document.created_at).toLocaleDateString("es-CL")}</p>
          </div>
        </header>

        <div className="mt-6 space-y-6">
          {template.sections.map((section, index) => (
            <section key={`${section.title}-${index}`} className="break-inside-avoid">
              <h2 className="border-b border-gray-200 pb-2 text-lg font-bold">{section.title}</h2>
              {section.paragraphs && (
                <div className="mt-3 space-y-3 text-sm leading-6">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              )}
              {section.fields && (
                <dl className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {section.fields.map((fieldName) => {
                    const field = template.fields.find((item) => item.name === fieldName);
                    if (!field) return null;
                    return (
                      <div key={fieldName} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{field.label}</dt>
                        <dd className="mt-1 whitespace-pre-wrap text-sm leading-6">
                          {record.document.data[fieldName]?.trim() || "________________________________"}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              )}
            </section>
          ))}
        </div>

        <footer className="mt-10 border-t border-gray-300 pt-4 text-xs text-gray-600">
          ZIPEK TECNOLOGÍA SpA · Quillota, Región de Valparaíso · {siteConfig.contact.phone}
        </footer>
      </article>
    </main>
  );
}
