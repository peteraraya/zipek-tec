import Link from "next/link";
import { notFound } from "next/navigation";
import InquiryNoteForm from "@/components/admin/InquiryNoteForm";
import InquiryStatusForm from "@/components/admin/InquiryStatusForm";
import { getServiceInquiry, AdminRecordNotFoundError } from "@/lib/admin/queries";
import {
  serviceInquirySourceLabels,
  serviceInquiryStatusLabels,
} from "@/lib/admin/types";

function getWhatsAppUrl(phone: string) {
  let number = phone.replace(/\D/g, "");
  if (number.length === 9 && number.startsWith("9")) number = `56${number}`;
  if (number.length < 8 || number.length > 15) return null;
  return `https://wa.me/${number}`;
}

export default async function ServiceInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  let data;
  try {
    data = await getServiceInquiry(id);
  } catch (error) {
    if (error instanceof AdminRecordNotFoundError) notFound();
    throw error;
  }

  const { inquiry, events } = data;
  const whatsappUrl =
    inquiry.contact_consent && inquiry.contact_phone
      ? getWhatsAppUrl(inquiry.contact_phone)
      : null;

  return (
    <section className="mx-auto max-w-4xl">
      <Link href="/admin/consultas" className="text-sm text-gray-400 hover:text-white">← Volver a consultas</Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">{serviceInquirySourceLabels[inquiry.source]}</p>
          <h1 className="mt-2 text-3xl font-bold text-white">{inquiry.inquiry_number}</h1>
          <p className="mt-2 text-gray-400">{inquiry.topic}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200">
          {serviceInquiryStatusLabels[inquiry.status]}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-semibold text-white">Consulta recibida</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-300">{inquiry.message}</p>
            <p className="mt-5 text-xs text-gray-500">Creada: {new Date(inquiry.created_at).toLocaleString("es-CL")}</p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-semibold text-white">Historial interno</h2>
            <ol className="mt-5 space-y-5 border-l border-white/10 pl-5">
              {events.map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[1.55rem] top-1.5 h-2 w-2 rounded-full bg-primary-light" />
                  {event.event_type === "status_changed" && event.new_status ? (
                    <p className="text-sm text-gray-200">
                      Estado: {event.previous_status ? serviceInquiryStatusLabels[event.previous_status] : "—"} → {serviceInquiryStatusLabels[event.new_status]}
                    </p>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm text-gray-200">{event.summary}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">{new Date(event.created_at).toLocaleString("es-CL")}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-semibold text-white">Contacto autorizado</h2>
            {inquiry.contact_consent ? (
              <div className="mt-4 space-y-2 text-sm text-gray-300">
                {inquiry.contact_name && <p>{inquiry.contact_name}</p>}
                {inquiry.contact_phone && <p>{inquiry.contact_phone}</p>}
                {inquiry.contact_email && <p className="break-all">{inquiry.contact_email}</p>}
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex rounded-lg bg-[#25D366] px-4 py-2 font-semibold text-white hover:bg-[#20bd5a]">
                    Responder por WhatsApp
                  </a>
                )}
                {inquiry.contact_email && (
                  <a href={`mailto:${inquiry.contact_email}`} className="mt-3 inline-flex rounded-lg border border-white/10 px-4 py-2 font-semibold text-gray-200 hover:bg-white/5">
                    Responder por correo
                  </a>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-400">La consulta se envió sin datos de contacto.</p>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-4 font-semibold text-white">Actualizar estado</h2>
            <InquiryStatusForm inquiry={inquiry} />
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-4 font-semibold text-white">Agregar seguimiento</h2>
            <InquiryNoteForm inquiryId={inquiry.id} />
          </section>
        </aside>
      </div>
    </section>
  );
}
