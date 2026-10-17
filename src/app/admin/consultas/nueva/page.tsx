import Link from "next/link";
import InquiryCreateForm from "@/components/admin/InquiryCreateForm";
import { requireStaff } from "@/lib/admin/auth";

export default async function NewWhatsAppInquiryPage() {
  await requireStaff("inquiries.manage");
  return (
    <section className="mx-auto max-w-3xl">
      <Link href="/admin/consultas" className="text-sm text-gray-400 hover:text-white">← Volver a consultas</Link>
      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">Registro interno</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Registrar consulta de WhatsApp</h1>
        <p className="mt-2 text-gray-400">Guarda la solicitud y su información de contacto solo si la persona autorizó usarla para responder.</p>
      </div>
      <div className="mt-8"><InquiryCreateForm /></div>
    </section>
  );
}
