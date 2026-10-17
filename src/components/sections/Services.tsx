import Link from "next/link";
import type { ReactElement } from "react";
import { ArrowRight, Building2, Check, House } from "lucide-react";
import { siteConfig } from "@/config/site";
import ComplementaryServices from "./ComplementaryServices";

const servicesForHome = [
  {
    audience: "Para tu casa",
    icon: House,
    id: "servicios-hogar",
    title: "Ayuda con tu computador",
    description:
      "Si está lento, necesita una instalación limpia o no sabes si conviene repararlo, partimos por revisar el problema contigo.",
    services: [
      "Puesta a punto e instalación de Windows con licencia o Linux.",
      "Respaldo de fotos, documentos y correo.",
      "Configuración de impresoras, Wi-Fi y equipos de red.",
      "Ayuda con seguridad, estafas y uso de aplicaciones.",
    ],
  },
  {
    audience: "Para tu negocio",
    icon: Building2,
    id: "servicios-pyme",
    title: "Soporte para tu pyme",
    description:
      "Revisamos equipos, licencias y respaldos. Si necesitas continuidad, podemos conversar un plan mensual con alcance acordado.",
    services: [
      "Mantenimiento preventivo y actualizaciones.",
      "Revisión de licencias y alternativas legales.",
      "Alternativas remotas o presenciales, según acuerdo y disponibilidad.",
      "Inventario de equipos y orientación sobre renovación.",
    ],
  },
];

type HomeServiceGroup = (typeof servicesForHome)[number];

interface ServiceAudienceCardProps {
  group: HomeServiceGroup;
}

/**
 * Presenta los servicios principales dirigidos a un tipo de cliente.
 *
 * @param props Datos de audiencia, descripción y servicios principales.
 * @returns Una tarjeta con información y enlace de consulta de la audiencia.
 */
function ServiceAudienceCard({ group }: ServiceAudienceCardProps): ReactElement {
  const Icon = group.icon;

  return (
    <article
      id={group.id}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-5 shadow-sm shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:border-primary-light/30 hover:shadow-xl hover:shadow-black/15 motion-reduce:transform-none motion-reduce:transition-none sm:p-7 lg:p-8"
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary-light/60 to-transparent"
      />
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-primary-light/20 bg-primary-light/[0.08] text-primary-light">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 pt-0.5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-light">
            {group.audience}
          </p>
          <h3 className="mt-1.5 text-xl font-semibold text-white sm:text-2xl">{group.title}</h3>
        </div>
      </div>
      <p className="mt-4 leading-6 text-gray-400 sm:mt-5 sm:leading-7">
        {group.description}
      </p>
      <ul className="mt-5 hidden space-y-3 border-t border-white/[0.08] pt-5 sm:block">
        {group.services.map((service) => (
          <li
            key={service}
            className="flex items-start gap-3 text-sm leading-6 text-gray-300 sm:text-base"
          >
            <Check className="mt-1 h-4 w-4 shrink-0 text-primary-light/80" aria-hidden="true" />
            <span>{service}</span>
          </li>
        ))}
      </ul>
      <details className="group mt-4 border-t border-white/[0.08] pt-2 sm:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-primary-light marker:hidden">
          Ver qué incluye
          <span
            aria-hidden="true"
            className="text-lg transition-transform group-open:rotate-45 motion-reduce:transition-none"
          >
            +
          </span>
        </summary>
        <ul className="space-y-2 pb-2 text-sm leading-5 text-gray-300">
          {group.services.map((service) => (
            <li key={service} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-light/80" aria-hidden="true" />
              <span>{service}</span>
            </li>
          ))}
        </ul>
      </details>
      <Link
        href={`/consultas?tema=${encodeURIComponent(group.title)}`}
        className="mt-auto inline-flex min-h-12 items-center justify-between gap-3 rounded-xl border border-primary-light/25 bg-primary-light/[0.07] px-4 py-3 text-sm font-semibold text-primary-light transition-colors hover:border-primary-light/45 hover:bg-primary-light/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light motion-reduce:transition-none"
      >
        <span>Consultar por este servicio</span>
        <ArrowRight
          className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </Link>
    </article>
  );
}

/**
 * Renderiza la sección pública de servicios para hogares, pymes y servicios adicionales.
 *
 * Sus datos son estáticos y los componentes se renderizan en el servidor, por lo que no
 * requieren estado cliente ni memoización de valores o callbacks.
 *
 * @returns La sección completa de servicios del sitio.
 */
export default function Services(): ReactElement {
  return (
    <section
      id="servicios"
      className="scroll-mt-24 border-b border-white/[0.07] bg-background py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl sm:mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">
            Servicios
          </p>
          <h2 className="mt-3 text-3xl text-white sm:text-4xl lg:text-[2.75rem]">
            Soluciones para el día a día.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
            Atendemos a familias y negocios en {siteConfig.contact.city}. Cuéntanos el problema y te
            diremos si podemos ayudarte.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
          {servicesForHome.map((group) => (
            <ServiceAudienceCard key={group.id} group={group} />
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-7 sm:mt-16 sm:pt-14">
          <ComplementaryServices />
        </div>
      </div>
    </section>
  );
}
