import Link from "next/link";
import { notFound } from "next/navigation";
import DocumentEditor from "@/components/admin/DocumentEditor";
import { getDocumentFieldValues, getDocumentTemplate } from "@/lib/admin/document-templates";
import { getClients, getServiceOrders } from "@/lib/admin/queries";

export default async function NewServiceDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ tipo: string }>;
  searchParams: Promise<{ cliente?: string; orden?: string }>;
}) {
  const [{ tipo }, query] = await Promise.all([params, searchParams]);
  const template = getDocumentTemplate(tipo);
  if (!template) notFound();

  const [clients, orders] = await Promise.all([getClients(), getServiceOrders()]);
  const initialClient = clients.find((client) => client.id === query.cliente) ?? clients[0];
  const initialOrder = orders.find(
    (order) => order.id === query.orden && order.client_id === initialClient?.id,
  );

  if (!initialClient) {
    return (
      <section className="mx-auto max-w-3xl">
        <Link href="/admin/documentos" className="text-sm text-gray-400 hover:text-white">← Documentos</Link>
        <h1 className="mt-5 text-3xl font-bold text-white">Selecciona un cliente</h1>
        <p className="mt-2 text-gray-400">Registra un cliente antes de crear documentos de servicio.</p>
        <Link href="/admin/clientes/nuevo" className="mt-6 inline-flex rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">
          Crear cliente
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl">
      <Link href="/admin/documentos" className="text-sm text-gray-400 hover:text-white">← Documentos de servicio</Link>
      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">Nuevo borrador</p>
      <h1 className="mt-2 text-3xl font-bold text-white">{template.title}</h1>
      <p className="mt-2 text-gray-400">{template.description}</p>
      <p className="mt-2 text-sm text-amber-200">
        Los documentos son borradores operativos. Revisa los datos y valida el contenido legal antes de enviarlos al cliente.
      </p>
      <div className="mt-8">
        <DocumentEditor
          template={template}
          clients={clients}
          orders={orders}
          initialClientId={initialClient.id}
          initialOrderId={initialOrder?.id ?? ""}
          initialData={getDocumentFieldValues(template, initialClient, initialOrder)}
        />
      </div>
    </section>
  );
}
