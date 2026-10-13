import Link from "next/link";
import PrintButton from "@/components/admin/PrintButton";
import { notFound } from "next/navigation";
import { AdminRecordNotFoundError, getServiceOrder } from "@/lib/admin/queries";
import { serviceStatusLabels } from "@/lib/admin/types";
import { siteConfig } from "@/config/site";

function Blank({ lines = 1 }: { lines?: number }) {
  return <span className={`inline-block min-w-32 border-b border-gray-600 ${lines > 1 ? "min-h-12" : "min-h-6"}`} />;
}

export default async function ServiceDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let record;
  try {
    record = await getServiceOrder(id);
  } catch (error) {
    if (error instanceof AdminRecordNotFoundError) notFound();
    throw error;
  }
  const { order, client } = record;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 text-gray-900 print:max-w-none print:p-0">
      <div className="no-print mb-6 flex items-center justify-between gap-4">
        <Link href={`/admin/ordenes/${id}`} className="text-sm text-gray-400 hover:text-white">← Volver a la orden</Link>
        <PrintButton />
      </div>
      <article className="print-document rounded-xl bg-white p-8 shadow-xl print:rounded-none print:p-10 print:shadow-none">
        <header className="flex items-start justify-between gap-6 border-b border-gray-300 pb-5">
          <div>
            <p className="text-2xl font-bold tracking-wide uppercase">{siteConfig.name}</p>
            <p className="mt-1 text-sm">WhatsApp {siteConfig.contact.phone} · {siteConfig.contact.city}, {siteConfig.contact.region}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">ANEXO A · ORDEN DE SERVICIO</p>
            <p className="mt-2">N° {order.order_number}</p>
            <p>{new Date(order.received_at).toLocaleDateString("es-CL")}</p>
          </div>
        </header>

        <section className="document-section mt-6">
          <h1 className="mb-4 text-lg font-bold">Datos del cliente y del equipo</h1>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <p>Nombre: <strong>{client.full_name}</strong></p>
            <p>RUT: {client.rut || <Blank />}</p>
            <p>Teléfono: {client.phone}</p>
            <p>Correo: {client.email || <Blank />}</p>
            <p>Equipo: {[order.equipment_brand, order.equipment_model].filter(Boolean).join(" ") || <Blank />}</p>
            <p>N° de serie: {order.equipment_serial || <Blank />}</p>
            <p className="col-span-2">Estado / modalidad: {order.initial_condition || <Blank />}</p>
          </div>
        </section>

        <section className="document-section mt-6 space-y-3 text-sm">
          <p><strong>Problema reportado:</strong> {order.reported_problem}</p>
          <p><strong>Servicio autorizado:</strong> {order.authorized_work}</p>
          <p><strong>Precio cerrado (CLP):</strong> {order.quoted_amount == null ? "A definir" : `$${Number(order.quoted_amount).toLocaleString("es-CL")}`}</p>
          <p><strong>Forma de pago:</strong> {order.payment_method || <Blank />}</p>
          <p><strong>Respaldo previo:</strong> {order.backup_status === "declined" ? "Rechazado por el cliente; informado del riesgo de pérdida." : order.backup_status}</p>
        </section>

        <section className="document-section mt-7 text-sm">
          <h2 className="mb-3 font-bold">Condiciones</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>El cliente autoriza únicamente los servicios descritos en esta orden. Todo trabajo adicional requiere nueva autorización y precio acordado.</li>
            <li>La información del equipo se utiliza solo para realizar el servicio; las copias temporales se eliminan al finalizar.</li>
            <li>Se ofrece respaldo de datos antes de intervenir. Si el cliente lo rechaza, queda informado del riesgo de pérdida de información.</li>
            <li>{siteConfig.shortName} no instala ni activa software sin licencia; se ofrecerán alternativas legales o gratuitas.</li>
            <li>Garantía de <strong>{order.warranty_days} días corridos</strong> desde la entrega, limitada al trabajo realizado.</li>
            <li>El precio indicado no cambia sin autorización escrita del cliente.</li>
          </ul>
        </section>

        <div className="document-section mt-12 grid grid-cols-2 gap-12 text-center text-sm">
          <p className="border-t border-gray-600 pt-2">Firma del cliente</p>
          <p className="border-t border-gray-600 pt-2">Firma {siteConfig.name}</p>
        </div>

        <div className="page-break my-10 border-t-2 border-dashed border-gray-300 print:my-0 print:border-0" />

        <header className="flex items-start justify-between gap-6 border-b border-gray-300 pb-5">
          <div>
            <p className="text-2xl font-bold tracking-wide uppercase">{siteConfig.name}</p>
            <p className="mt-1 text-sm">WhatsApp {siteConfig.contact.phone} · {siteConfig.contact.city}, {siteConfig.contact.region}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">ANEXO B · INFORME DE SERVICIO</p>
            <p className="mt-2">Orden {order.order_number}</p>
            <p>Fecha de entrega: {order.delivered_at ? new Date(order.delivered_at).toLocaleDateString("es-CL") : "________________"}</p>
          </div>
        </header>

        <section className="document-section mt-6 space-y-3 text-sm">
          <p><strong>Cliente:</strong> {client.full_name}</p>
          <p><strong>Equipo:</strong> {[order.equipment_brand, order.equipment_model].filter(Boolean).join(" ") || "No especificado"}</p>
          <p><strong>Estado del servicio:</strong> {serviceStatusLabels[order.status]}</p>
          <h2 className="pt-2 font-bold">1. Diagnóstico inicial</h2>
          <p className="min-h-12 whitespace-pre-wrap">{order.diagnosis || "Pendiente de completar"}</p>
          <h2 className="pt-2 font-bold">2. Trabajos y respaldo de datos</h2>
          <p className="min-h-12 whitespace-pre-wrap">{order.service_description}</p>
          <p><strong>Respaldo:</strong> {order.backup_details || order.backup_status}</p>
        </section>

        <section className="document-section mt-6">
          <h2 className="mb-3 text-sm font-bold">3. Software instalado</h2>
          <table className="w-full border-collapse text-left text-sm">
            <thead><tr><th className="border border-gray-400 p-2">Programa</th><th className="border border-gray-400 p-2">Tipo (libre / con licencia)</th><th className="border border-gray-400 p-2">Observación</th></tr></thead>
            <tbody>
              {[...order.software_installed, ...Array.from({ length: Math.max(0, 3 - order.software_installed.length) }, () => ({ name: "", license_type: "", notes: "" }))].map((software, index) => (
                <tr key={`${software.name}-${index}`}><td className="h-9 border border-gray-400 p-2">{software.name}</td><td className="border border-gray-400 p-2">{software.license_type}</td><td className="border border-gray-400 p-2">{software.notes}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="document-section mt-6 space-y-3 text-sm">
          <h2 className="font-bold">4. Recomendaciones</h2>
          <p className="min-h-12 whitespace-pre-wrap">{order.recommendations || "Sin recomendaciones adicionales."}</p>
          <h2 className="pt-2 font-bold">5. Garantía y seguimiento</h2>
          <p>Garantía de {order.warranty_days} días corridos desde la fecha de entrega. Seguimiento por WhatsApp: __________________.</p>
        </section>

        <div className="document-section mt-12 grid grid-cols-2 gap-12 text-center text-sm">
          <p className="border-t border-gray-600 pt-2">Firma del cliente (conforme)</p>
          <p className="border-t border-gray-600 pt-2">Firma {siteConfig.name}</p>
        </div>
      </article>
    </main>
  );
}
