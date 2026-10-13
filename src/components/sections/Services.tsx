import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const servicesForHome = [
  {
    audience: "Para tu casa",
    id: "servicios-hogar",
    title: "Ayuda con tu computador",
    description: "Si está lento, necesita una instalación limpia o no sabes si conviene repararlo, partimos por revisar el problema contigo.",
    services: [
      "Puesta a punto e instalación de Windows con licencia o Linux.",
      "Respaldo de fotos, documentos y correo.",
      "Configuración de impresoras, Wi-Fi y equipos de red.",
      "Ayuda con seguridad, estafas y uso de aplicaciones.",
    ],
  },
  {
    audience: "Para tu negocio",
    id: "servicios-pyme",
    title: "Soporte para tu pyme",
    description: "Revisamos equipos, licencias y respaldos. Si necesitas continuidad, podemos conversar un plan mensual con alcance acordado.",
    services: [
      "Mantenimiento preventivo y actualizaciones.",
      "Revisión de licencias y alternativas legales.",
      "Soporte remoto y visitas programadas.",
      "Inventario de equipos y recomendaciones de compra.",
    ],
  },
];

export default function Services() {
  return (
    <section id="servicios" className="border-b border-white/[0.07] bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl sm:mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Servicios</p>
          <h2 className="mt-3 text-3xl text-white md:text-4xl">Soluciones para el día a día.</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
            Atendemos a familias y negocios en Quillota. Cuéntanos el problema y te diremos si podemos ayudarte.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {servicesForHome.map((group) => (
            <article id={group.id} key={group.title} className="scroll-mt-24 border border-white/[0.09] bg-white/[0.018] p-6 sm:p-8 lg:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-light">{group.audience}</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{group.title}</h3>
              <p className="mt-3 min-h-14 max-w-xl leading-7 text-gray-400">{group.description}</p>
              <ul className="mt-6 space-y-3 border-t border-white/[0.08] pt-6">
                {group.services.map((service) => (
                  <li key={service} className="flex items-start gap-3 text-sm leading-6 text-gray-300 sm:text-base">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-primary-light/80" aria-hidden="true" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
              <Link href={`/consultas?tema=${encodeURIComponent(group.title)}`} className="mt-7 inline-flex min-h-11 items-center gap-2 border-t border-white/[0.08] pt-5 text-sm font-semibold text-primary-light transition hover:text-white">
                Consultar por este servicio <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
