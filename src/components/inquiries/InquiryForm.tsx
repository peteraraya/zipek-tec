"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl, siteConfig } from "@/config/site";

export default function InquiryForm({ initialTopic = "" }: { initialTopic?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [inquiryNumber, setInquiryNumber] = useState("");
  const [responseRequested, setResponseRequested] = useState(true);

  const whatsappUrl = inquiryNumber
    ? getWhatsAppUrl(`Hola, registré la consulta ${inquiryNumber} y quiero agregar información.`)
    : "";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const hasContact = ["contact_name", "contact_phone", "contact_email"].some(
      (name) => String(formData.get(name) ?? "").trim() !== "",
    );
    const hasReplyChannel = ["contact_phone", "contact_email"].some(
      (name) => String(formData.get(name) ?? "").trim() !== "",
    );

    if (responseRequested && !hasReplyChannel) {
      setError("Para recibir respuesta, indica un teléfono o correo.");
      setIsSubmitting(false);
      return;
    }

    if (responseRequested && formData.get("contact_consent") !== "on") {
      setError("Autoriza el uso de tus datos para que podamos responder esta consulta.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: formData.get("topic"),
          message: formData.get("message"),
          contact_name: responseRequested ? formData.get("contact_name") : "",
          contact_phone: responseRequested ? formData.get("contact_phone") : "",
          contact_email: responseRequested ? formData.get("contact_email") : "",
          contact_consent: responseRequested && hasContact && formData.get("contact_consent") === "on",
        }),
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(typeof payload.error === "string" ? payload.error : "No se pudo enviar la consulta.");
        return;
      }

      setInquiryNumber(payload.inquiryNumber);
      form.reset();
    } catch {
      setError("No se pudo conectar para enviar la consulta. Revisa tu conexión e inténtalo nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (inquiryNumber) {
    return (
      <section aria-live="polite" className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-emerald-200">Consulta registrada</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-300">
          {responseRequested
            ? "Guarda este código por si necesitas agregar información por WhatsApp."
            : "Esta consulta se registró sin datos de contacto, por lo que no podremos responderte. Guarda el código si quieres retomarla por WhatsApp."}
        </p>
        <p className="mt-4 rounded-lg bg-black/20 p-4 text-center font-mono text-lg font-semibold tracking-wider text-white">
          {inquiryNumber}
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#20bd5a]"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Continuar por WhatsApp con este código
        </a>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
      {error && <p role="alert" className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
      <fieldset className="space-y-3 rounded-xl border border-white/10 p-4">
        <legend className="px-2 text-sm font-medium text-gray-200">¿Quieres que te respondamos?</legend>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-300">
          <input
            type="radio"
            name="response_preference"
            checked={responseRequested}
            onChange={() => setResponseRequested(true)}
            className="mt-1 accent-primary"
          />
          <span>
            <span className="block font-medium text-white">Sí, quiero recibir respuesta</span>
            <span className="mt-1 block text-xs leading-relaxed text-gray-400">
              Deja un teléfono o correo y autoriza su uso solo para responder esta consulta.
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-300">
          <input
            type="radio"
            name="response_preference"
            checked={!responseRequested}
            onChange={() => setResponseRequested(false)}
            className="mt-1 accent-primary"
          />
          <span>
            <span className="block font-medium text-white">No, solo quiero dejar una consulta anónima</span>
            <span className="mt-1 block text-xs leading-relaxed text-gray-400">
              No podremos contactarte para responder. Puedes escribirnos directamente por WhatsApp si lo prefieres.
            </span>
          </span>
        </label>
      </fieldset>
      <div>
        <label htmlFor="inquiry-topic" className="block text-sm font-medium text-gray-200">Tema de la consulta</label>
        <input
          id="inquiry-topic"
          name="topic"
          defaultValue={initialTopic}
          required
          minLength={3}
          maxLength={100}
          className="mt-2 min-h-12 w-full rounded-lg border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Por ejemplo: respaldo de archivos"
        />
      </div>
      <div>
        <label htmlFor="inquiry-message" className="block text-sm font-medium text-gray-200">¿En qué podemos ayudarte?</label>
        <textarea
          id="inquiry-message"
          name="message"
          required
          minLength={10}
          maxLength={3000}
          rows={5}
          className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Describe brevemente tu pregunta o solicitud."
        />
        <p className="mt-2 text-xs text-gray-500">No incluyas contraseñas, RUT ni información sensible en el mensaje.</p>
      </div>

      {responseRequested && (
        <fieldset className="space-y-4 rounded-xl border border-white/10 p-4">
          <legend className="px-2 text-sm font-medium text-gray-200">Datos para responder</legend>
          <p className="text-xs leading-relaxed text-gray-400">
            Indica al menos un medio de contacto. Lo usaremos únicamente para responder esta consulta, no para publicidad.
          </p>
          <div>
            <label htmlFor="contact-name" className="block text-sm text-gray-300">Nombre (opcional)</label>
            <input id="contact-name" name="contact_name" maxLength={160} autoComplete="name" className="mt-2 min-h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white focus:border-primary focus:outline-none" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-phone" className="block text-sm text-gray-300">WhatsApp o teléfono</label>
              <input id="contact-phone" name="contact_phone" type="tel" maxLength={40} autoComplete="tel" className="mt-2 min-h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm text-gray-300">Correo electrónico</label>
              <input id="contact-email" name="contact_email" type="email" maxLength={254} autoComplete="email" className="mt-2 min-h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white focus:border-primary focus:outline-none" />
            </div>
          </div>
          <label className="flex items-start gap-3 text-xs leading-relaxed text-gray-400">
            <input name="contact_consent" type="checkbox" required className="mt-0.5 accent-primary" />
            <span>
              Autorizo a {siteConfig.name} a usar mis datos solo para responder esta consulta. Consulta la{" "}
              <Link href="/privacidad" className="text-primary-light underline">política de privacidad</Link>.
            </span>
          </label>
        </fieldset>
      )}

      <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
        {isSubmitting ? "Enviando..." : "Enviar consulta"}
      </button>
    </form>
  );
}
