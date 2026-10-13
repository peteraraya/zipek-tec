import Link from "next/link";
import { getServiceInquiries } from "@/lib/admin/queries";
import {
  serviceInquirySourceLabels,
  serviceInquiryStatusLabels,
} from "@/lib/admin/types";

export default async function ServiceInquiriesPage() {
  const inquiries = await getServiceInquiries();

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">Atención</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Consultas</h1>
          <p className="mt-2 text-gray-400">Consultas web y conversaciones de WhatsApp registradas por el equipo.</p>
        </div>
        <Link href="/admin/consultas/nueva" className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-light">
          Registrar WhatsApp
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-6 py-4 font-medium">Referencia</th>
              <th className="px-6 py-4 font-medium">Tema</th>
              <th className="px-6 py-4 font-medium">Canal</th>
              <th className="px-6 py-4 font-medium">Contacto autorizado</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4 font-medium">Actualizada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id} className="text-gray-300">
                <td className="px-6 py-4">
                  <Link href={`/admin/consultas/${inquiry.id}`} className="font-semibold text-white hover:text-primary-light">
                    {inquiry.inquiry_number}
                  </Link>
                </td>
                <td className="px-6 py-4">{inquiry.topic}</td>
                <td className="px-6 py-4">{serviceInquirySourceLabels[inquiry.source]}</td>
                <td className="px-6 py-4">{inquiry.contact_consent ? inquiry.contact_name ?? inquiry.contact_phone ?? inquiry.contact_email : "Sin contacto"}</td>
                <td className="px-6 py-4">{serviceInquiryStatusLabels[inquiry.status]}</td>
                <td className="px-6 py-4">{new Date(inquiry.updated_at).toLocaleDateString("es-CL")}</td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Todavía no hay consultas registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {inquiries.length === 200 && <p className="mt-3 text-xs text-gray-500">Se muestran las 200 consultas más recientes.</p>}
    </section>
  );
}
