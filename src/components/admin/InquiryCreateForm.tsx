"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createWhatsAppInquiryAction, type InquiryCreateState } from "@/app/actions/admin";
import { AdminField, AdminInput, AdminTextarea, adminButtonClass } from "@/components/admin/AdminField";

export default function InquiryCreateForm() {
  const [state, action, pending] = useActionState<InquiryCreateState, FormData>(
    createWhatsAppInquiryAction,
    {},
  );

  if (state.inquiryId && state.inquiryNumber) {
    return (
      <section className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6">
        <h2 className="font-semibold text-emerald-200">Consulta registrada: {state.inquiryNumber}</h2>
        <p className="mt-2 text-sm text-gray-300">La consulta de WhatsApp quedó guardada en el panel interno.</p>
        <Link href={`/admin/consultas/${state.inquiryId}`} className="mt-4 inline-block text-sm text-primary-light underline">
          Abrir consulta
        </Link>
      </section>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state.error && <p role="alert" className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{state.error}</p>}
      <p className="rounded-lg border border-sky-400/20 bg-sky-400/5 p-4 text-sm leading-relaxed text-sky-100">
        Registra manualmente las consultas recibidas por WhatsApp. Este formulario no importa mensajes automáticamente desde WhatsApp.
      </p>
      <AdminField label="Tema">
        <AdminInput name="topic" required minLength={3} maxLength={100} />
      </AdminField>
      <AdminField label="Consulta recibida">
        <AdminTextarea name="message" required minLength={10} maxLength={3000} rows={5} />
      </AdminField>
      <div className="grid gap-5 sm:grid-cols-2">
        <AdminField label="Nombre (opcional)">
          <AdminInput name="contact_name" maxLength={160} />
        </AdminField>
        <AdminField label="WhatsApp o teléfono (opcional)">
          <AdminInput name="contact_phone" type="tel" maxLength={40} />
        </AdminField>
      </div>
      <AdminField label="Correo (opcional)">
        <AdminInput name="contact_email" type="email" maxLength={254} />
      </AdminField>
      <label className="flex items-start gap-3 text-sm leading-relaxed text-gray-400">
        <input name="contact_consent" type="checkbox" className="mt-1 accent-primary" />
        <span>La persona autorizó usar el teléfono o correo únicamente para responder y dar seguimiento a esta consulta.</span>
      </label>
      <button type="submit" className={adminButtonClass} disabled={pending}>
        {pending ? "Guardando consulta..." : "Registrar consulta de WhatsApp"}
      </button>
    </form>
  );
}
