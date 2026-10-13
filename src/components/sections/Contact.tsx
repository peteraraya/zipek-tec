import Link from "next/link";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { getEmailUrl, getWhatsAppUrl, siteConfig } from "@/config/site";

export default function Contact() {
  const whatsappUrl = getWhatsAppUrl("Hola, necesito ayuda con un equipo o servicio informático.");

  return (
    <section id="contacto" className="bg-[#0a1120] py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:gap-16 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Hablemos</p>
          <h2 className="mt-3 max-w-xl text-3xl text-white md:text-4xl">
            Un buen soporte empieza por escucharte.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
            No necesitas saber el nombre técnico de la falla. Describe lo que ocurre y te orientamos sobre el siguiente paso.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
            La disponibilidad, modalidad de atención y cualquier costo aplicable se confirman antes de coordinar el trabajo.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-hover"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Escribir por WhatsApp
            </a>
            <Link
              href="/consultas"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 px-5 py-3 font-semibold text-white transition hover:border-primary-light/40 hover:bg-white/[0.04]"
            >
              Enviar consulta web
            </Link>
          </div>
        </div>

        <aside className="border border-white/[0.09] bg-white/[0.018] p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-white">{siteConfig.name}</h3>
          <p className="mt-2 text-sm text-gray-400">Soporte para hogares y pymes en {siteConfig.contact.city}.</p>
          <dl className="mt-6 space-y-5">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary-light" aria-hidden="true" />
              <div>
                <dt className="text-xs text-gray-500">Ubicación</dt>
                <dd className="mt-1 text-sm text-gray-200">{siteConfig.contact.location}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary-light" aria-hidden="true" />
              <div>
                <dt className="text-xs text-gray-500">WhatsApp</dt>
                <dd className="mt-1 text-sm text-gray-200">{siteConfig.contact.phone}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary-light" aria-hidden="true" />
              <div>
                <dt className="text-xs text-gray-500">Correo</dt>
                <dd className="mt-1 text-sm text-gray-200">
                  <a href={getEmailUrl()} className="hover:text-primary-light">
                    {siteConfig.contact.email}
                  </a>
                </dd>
              </div>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
