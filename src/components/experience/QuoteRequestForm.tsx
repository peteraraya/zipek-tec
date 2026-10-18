"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { getWhatsAppUrl, siteConfig } from "@/config/site";
import { publicQuoteRequestSchema } from "@/lib/admin/validation";

type QuoteRequestFormProps = {
  equipmentType: string;
  modality: string;
  selectedWork: string[];
};

type QuoteFormField =
  | "contact_name"
  | "contact_phone"
  | "contact_email"
  | "brand_model"
  | "location"
  | "issue"
  | "quote_contact_consent";

const quoteFieldBySchemaPath: Record<string, QuoteFormField> = {
  contact_name: "contact_name",
  contact_phone: "contact_phone",
  contact_email: "contact_email",
  "request_details.brand_model": "brand_model",
  "request_details.location": "location",
  "request_details.issue": "issue",
  contact_consent: "quote_contact_consent",
};

function isQuoteFormField(field: string): field is QuoteFormField {
  return field in quoteFieldBySchemaPath || field === "quote_contact_consent";
}

export default function QuoteRequestForm({
  equipmentType,
  modality,
  selectedWork,
}: QuoteRequestFormProps) {
  const [error, setError] = useState("");
  const [inquiryNumber, setInquiryNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<QuoteFormField, string>>>({});
  const [touchedFields, setTouchedFields] = useState<Partial<Record<QuoteFormField, boolean>>>({});

  function validate(form: HTMLFormElement) {
    const formData = new FormData(form);
    const parsed = publicQuoteRequestSchema.safeParse({
      contact_name: formData.get("contact_name"),
      contact_phone: formData.get("contact_phone"),
      contact_email: formData.get("contact_email"),
      contact_consent: formData.get("quote_contact_consent") === "on",
      request_details: {
        equipment_type: equipmentType,
        brand_model: formData.get("brand_model"),
        issue: formData.get("issue"),
        modality,
        location: formData.get("location"),
        tasks: selectedWork,
      },
    });
    const nextErrors: Partial<Record<QuoteFormField, string>> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = quoteFieldBySchemaPath[issue.path.join(".")];
        if (field && !nextErrors[field]) nextErrors[field] = issue.message;
      }
    }
    setFieldErrors(nextErrors);
    return parsed;
  }

  function validateField(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const field = event.currentTarget.name;
    if (!isQuoteFormField(field)) return;
    if (!touchedFields[field]) return;
    const form = event.currentTarget.form;
    if (form) validate(form);
  }

  function touchAndValidateField(
    event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const field = event.currentTarget.name;
    if (!isQuoteFormField(field)) return;
    setTouchedFields((current) => ({ ...current, [field]: true }));
    const form = event.currentTarget.form;
    if (form) validate(form);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const contactConsent = formData.get("quote_contact_consent") === "on";
    const parsed = validate(form);
    setTouchedFields({
      contact_name: true,
      contact_phone: true,
      contact_email: true,
      brand_model: true,
      location: true,
      issue: true,
      quote_contact_consent: true,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los datos ingresados.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_name: formData.get("contact_name"),
          contact_phone: formData.get("contact_phone"),
          contact_email: formData.get("contact_email"),
          contact_consent: contactConsent,
          request_details: {
            equipment_type: equipmentType,
            brand_model: formData.get("brand_model"),
            issue: formData.get("issue"),
            modality,
            location: formData.get("location"),
            tasks: selectedWork,
          },
        }),
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(typeof payload.error === "string" ? payload.error : "No se pudo registrar la solicitud.");
        return;
      }
      if (typeof payload.inquiryNumber !== "string" || !payload.inquiryNumber.startsWith("CONS-")) {
        setError("No se pudo confirmar el registro. Inténtalo nuevamente.");
        return;
      }
      setInquiryNumber(payload.inquiryNumber);
      form.reset();
    } catch {
      setError("No se pudo conectar para registrar la solicitud. Revisa tu conexión e inténtalo nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (inquiryNumber) {
    const whatsappUrl = getWhatsAppUrl(
      `Hola, registré la solicitud de cotización ${inquiryNumber} y quiero agregar información.`,
    );

    return (
      <section aria-live="polite" className="mt-6 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.05] p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" aria-hidden="true" />
          <div>
            <h4 className="font-semibold text-emerald-100">Solicitud registrada</h4>
            <p className="mt-1 text-sm leading-6 text-gray-300">Guardamos tu solicitud para que el equipo la revise. Aún no es una cotización ni confirma precio, agenda o inicio del trabajo.</p>
            <p className="mt-3 font-mono text-sm text-white">{inquiryNumber}</p>
            <div className="mt-4 flex flex-wrap gap-4">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary-light hover:text-white">Agregar información por WhatsApp</a>
              <button type="button" onClick={() => setInquiryNumber("")} className="text-sm font-medium text-gray-400 hover:text-white">Registrar otra solicitud</button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="mt-6 space-y-4 border-t border-white/10 pt-6">
      <div>
        <h4 className="font-semibold text-white">Registrar solicitud en el panel</h4>
        <p className="mt-1 text-sm leading-6 text-gray-400">Esta información se incorpora a Consultas para que podamos preparar una propuesta. Te pediremos autorización antes de hacer cualquier trabajo.</p>
      </div>
      {error && <p role="alert" className="rounded-lg border border-red-300/20 bg-red-300/[0.06] p-3 text-sm text-red-100">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-200">
          Nombre
          <input name="contact_name" autoComplete="name" maxLength={160} aria-invalid={Boolean(touchedFields.contact_name && fieldErrors.contact_name)} aria-describedby={touchedFields.contact_name && fieldErrors.contact_name ? "quote-name-error" : undefined} onChange={validateField} onBlur={touchAndValidateField} className="mt-2 min-h-11 w-full rounded-lg border border-white/10 bg-background px-3 text-sm text-white" />
          {touchedFields.contact_name && fieldErrors.contact_name && <span id="quote-name-error" className="mt-1 block text-xs text-red-200">{fieldErrors.contact_name}</span>}
        </label>
        <label className="block text-sm font-medium text-gray-200">
          Teléfono o WhatsApp
          <input name="contact_phone" type="tel" autoComplete="tel" maxLength={40} aria-invalid={Boolean(touchedFields.contact_phone && fieldErrors.contact_phone)} aria-describedby={touchedFields.contact_phone && fieldErrors.contact_phone ? "quote-phone-error" : undefined} onChange={validateField} onBlur={touchAndValidateField} className="mt-2 min-h-11 w-full rounded-lg border border-white/10 bg-background px-3 text-sm text-white" />
          {touchedFields.contact_phone && fieldErrors.contact_phone && <span id="quote-phone-error" className="mt-1 block text-xs text-red-200">{fieldErrors.contact_phone}</span>}
        </label>
        <label className="block text-sm font-medium text-gray-200">
          Correo (opcional)
          <input name="contact_email" type="email" autoComplete="email" maxLength={254} aria-invalid={Boolean(touchedFields.contact_email && fieldErrors.contact_email)} aria-describedby={touchedFields.contact_email && fieldErrors.contact_email ? "quote-email-error" : undefined} onChange={validateField} onBlur={touchAndValidateField} className="mt-2 min-h-11 w-full rounded-lg border border-white/10 bg-background px-3 text-sm text-white" />
          {touchedFields.contact_email && fieldErrors.contact_email && <span id="quote-email-error" className="mt-1 block text-xs text-red-200">{fieldErrors.contact_email}</span>}
        </label>
        <label className="block text-sm font-medium text-gray-200">
          Marca y modelo (opcional)
          <input name="brand_model" maxLength={120} aria-invalid={Boolean(touchedFields.brand_model && fieldErrors.brand_model)} aria-describedby={touchedFields.brand_model && fieldErrors.brand_model ? "quote-model-error" : undefined} onChange={validateField} onBlur={touchAndValidateField} className="mt-2 min-h-11 w-full rounded-lg border border-white/10 bg-background px-3 text-sm text-white" />
          {touchedFields.brand_model && fieldErrors.brand_model && <span id="quote-model-error" className="mt-1 block text-xs text-red-200">{fieldErrors.brand_model}</span>}
        </label>
      </div>
      <label className="block text-sm font-medium text-gray-200">
        Comuna o sector (opcional)
        <input name="location" maxLength={120} autoComplete="address-level2" aria-invalid={Boolean(touchedFields.location && fieldErrors.location)} aria-describedby={touchedFields.location && fieldErrors.location ? "quote-location-error" : undefined} onChange={validateField} onBlur={touchAndValidateField} className="mt-2 min-h-11 w-full rounded-lg border border-white/10 bg-background px-3 text-sm text-white" />
        {touchedFields.location && fieldErrors.location && <span id="quote-location-error" className="mt-1 block text-xs text-red-200">{fieldErrors.location}</span>}
      </label>
      <label className="block text-sm font-medium text-gray-200">
        Describe el problema o lo que necesitas
        <textarea name="issue" maxLength={2000} rows={4} aria-invalid={Boolean(touchedFields.issue && fieldErrors.issue)} aria-describedby={touchedFields.issue && fieldErrors.issue ? "quote-issue-error" : undefined} onChange={validateField} onBlur={touchAndValidateField} className="mt-2 w-full rounded-lg border border-white/10 bg-background px-3 py-3 text-sm text-white" placeholder="¿Qué ocurre y desde cuándo?" />
        {touchedFields.issue && fieldErrors.issue && <span id="quote-issue-error" className="mt-1 block text-xs text-red-200">{fieldErrors.issue}</span>}
        <span className="mt-1 block text-xs font-normal text-gray-500">No incluyas RUT, contraseñas, códigos, ni datos o archivos personales.</span>
      </label>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 p-3 text-sm text-gray-300">
        <input name="quote_contact_consent" type="checkbox" onChange={validateField} onBlur={touchAndValidateField} aria-invalid={Boolean(touchedFields.quote_contact_consent && fieldErrors.quote_contact_consent)} aria-describedby={touchedFields.quote_contact_consent && fieldErrors.quote_contact_consent ? "quote-consent-error" : undefined} className="mt-1 h-4 w-4 accent-primary" />
        <span>
          Autorizo que Zipek use estos datos para responder esta solicitud, preparar una propuesta y coordinar el servicio. No se usarán para publicidad.
          {touchedFields.quote_contact_consent && fieldErrors.quote_contact_consent && <span id="quote-consent-error" className="mt-1 block text-xs text-red-200">{fieldErrors.quote_contact_consent}</span>}
        </span>
      </label>
      <p className="text-xs leading-5 text-gray-500">
        Revisa la <Link href="/privacidad" className="underline underline-offset-2 hover:text-gray-300">política de privacidad</Link>. Registramos la solicitud con referencia de consulta.
      </p>
      <button type="submit" disabled={isSubmitting} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        {isSubmitting ? "Registrando solicitud..." : "Registrar solicitud de cotización"}
      </button>
      <p className="text-xs text-gray-500">{siteConfig.shortName} no enviará un diagnóstico ni precio automático.</p>
    </form>
  );
}
