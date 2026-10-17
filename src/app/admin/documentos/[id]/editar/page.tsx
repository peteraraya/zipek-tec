import Link from "next/link";
import { notFound } from "next/navigation";
import DocumentEditor from "@/components/admin/DocumentEditor";
import { AdminRecordNotFoundError, getClients, getServiceDocument, getServiceOrders } from "@/lib/admin/queries";
import { getDocumentFieldValues, getDocumentTemplate } from "@/lib/admin/document-templates";

export default async function EditServiceDocumentPage({
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
  const [clients, orders] = await Promise.all([getClients(true), getServiceOrders()]);

  return (
    <section className="mx-auto max-w-4xl">
      <Link href={`/admin/documentos/${id}`} className="text-sm text-gray-400 hover:text-white">← Volver al documento</Link>
      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">Editar borrador</p>
      <h1 className="mt-2 text-3xl font-bold text-white">{template.title}</h1>
      <div className="mt-8">
        <DocumentEditor
          template={template}
          clients={clients}
          orders={orders}
          initialClientId={record.client.id}
          initialOrderId={record.document.order_id ?? ""}
          initialData={getDocumentFieldValues(template, record.client, undefined, record.document.data)}
          documentId={id}
        />
      </div>
    </section>
  );
}
