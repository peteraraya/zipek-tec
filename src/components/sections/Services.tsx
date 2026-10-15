import Link from "next/link";
import { ArrowRight, Check, ChevronDown, ClipboardCheck, ListChecks, PackageCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { complementaryServiceGroups, type ComplementaryService } from "./complementary-services";

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
      "Alternativas remotas o presenciales, según acuerdo y disponibilidad.",
      "Inventario de equipos y orientación sobre renovación.",
    ],
  },
];

function ServiceScope({ service }: { service: ComplementaryService }) {
  const scopeItems = [
    { icon: ListChecks, label: "Puede incluir", description: service.includes },
    { icon: ClipboardCheck, label: "Confirmamos antes", description: service.confirm },
    { icon: PackageCheck, label: "Recibes", description: service.delivery },
  ];

  return (
    <dl className="space-y-2 border-t border-white/10 py-3 text-xs leading-5 sm:text-sm">
      {scopeItems.map(({ icon: Icon, label, description }, index) => (
        <div key={label} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2 rounded-lg border border-white/[0.06] bg-black/10 p-2.5 sm:grid-cols-[2rem_1.25rem_8.5rem_minmax(0,1fr)] sm:items-start">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-light/[0.08] text-[10px] font-semibold tabular-nums text-primary-light sm:h-7 sm:w-7">
            0{index + 1}
          </span>
          <Icon className="col-start-1 row-start-2 mt-1 h-4 w-4 text-primary-light sm:col-start-2 sm:row-start-1 sm:mt-1.5" aria-hidden="true" />
          <dt className="col-start-2 row-start-1 self-center font-semibold text-white sm:col-start-3 sm:self-start">
            {label}
          </dt>
          <dd className="col-start-2 row-start-2 mt-1 text-gray-400 sm:col-start-4 sm:row-span-1 sm:row-start-1 sm:mt-0">
            {description}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function Services() {
  return (
    <section id="servicios" className="border-b border-white/[0.07] bg-background py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl sm:mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Servicios</p>
          <h2 className="mt-3 text-3xl text-white md:text-4xl">Soluciones para el día a día.</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
            Atendemos a familias y negocios en {siteConfig.contact.city}. Cuéntanos el problema y te diremos si podemos ayudarte.
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          {servicesForHome.map((group) => (
            <article id={group.id} key={group.title} className="scroll-mt-24 border border-white/[0.09] bg-white/[0.018] p-4 sm:p-8 lg:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-light">{group.audience}</p>
              <h3 className="mt-2 text-xl font-semibold text-white sm:mt-3 sm:text-2xl">{group.title}</h3>
              <p className="mt-2 leading-6 text-gray-400 sm:mt-3 sm:min-h-14 sm:leading-7">{group.description}</p>
              <ul className="mt-4 hidden space-y-3 border-t border-white/[0.08] pt-6 sm:block">
                {group.services.map((service) => (
                  <li key={service} className="flex items-start gap-3 text-sm leading-6 text-gray-300 sm:text-base">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-primary-light/80" aria-hidden="true" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
              <details className="group mt-3 border-t border-white/[0.08] pt-2 sm:hidden">
                <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-primary-light marker:hidden">
                  Ver qué incluye
                  <span aria-hidden="true" className="text-lg transition-transform group-open:rotate-45">+</span>
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
              <Link href={`/consultas?tema=${encodeURIComponent(group.title)}`} className="mt-3 inline-flex min-h-10 items-center gap-2 border-t border-white/[0.08] pt-3 text-sm font-semibold text-primary-light transition hover:text-white sm:mt-7 sm:min-h-11 sm:pt-5">
                Consultar por este servicio <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-7 sm:mt-16 sm:pt-14">
          <div className="mb-5 max-w-2xl sm:mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-light">Más apoyo, a tu medida</p>
            <h3 className="mt-2 text-2xl font-semibold text-white sm:mt-3 sm:text-3xl">Servicios complementarios</h3>
            <p className="mt-2 text-sm leading-6 text-gray-400 sm:mt-3 sm:text-base sm:leading-7">
              Revisa qué puede incluir cada servicio; definimos su alcance, costos y exclusiones antes de autorizar.
            </p>
          </div>

          <div className="space-y-3">
            {complementaryServiceGroups.map((group) => {
              const Icon = group.icon;

              return (
                <details key={group.title} className="group border border-white/[0.09] bg-white/[0.018]">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 p-4 marker:hidden sm:px-5">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary-light/20 bg-primary-light/[0.06] text-primary-light">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <h4 className="font-semibold text-white">{group.title}</h4>
                        <span className="mt-0.5 block text-xs leading-5 text-gray-400">{group.summary}</span>
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="hidden text-xs text-gray-500 sm:inline">
                        {group.services.length} {group.services.length === 1 ? "servicio" : "servicios"}
                      </span>
                      <ChevronDown className="h-5 w-5 text-primary-light transition-transform group-open:rotate-180" aria-hidden="true" />
                    </span>
                  </summary>

                  <div className="grid gap-3 border-t border-white/[0.08] px-3 pb-3 pt-3 sm:grid-cols-2 sm:px-4 sm:pb-4">
                    {group.services.map((service) => (
                      <article key={service.title} className="border border-white/[0.08] bg-white/[0.02] p-4">
                        <h5 className="font-semibold text-white">{service.title}</h5>
                        <p className="mt-1.5 text-sm leading-5 text-gray-400">{service.description}</p>
                        <details className="group/scope mt-3 border-t border-white/10 pt-2">
                          <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-primary-light marker:hidden">
                            Ver alcance en 3 pasos
                            <ChevronDown className="h-4 w-4 transition-transform group-open/scope:rotate-180" aria-hidden="true" />
                          </summary>
                          <ServiceScope service={service} />
                        </details>
                        <Link
                          href={`/consultas?tema=${encodeURIComponent(service.topic)}`}
                          className="mt-2 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary-light transition hover:text-white"
                        >
                          Consultar esta opción <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </article>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <aside className="border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-light">Se confirma antes de autorizar</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {["Valores", "Disponibilidad", "Modalidad", "Costo de revisión", "Condiciones de garantía"].map((item) => (
                  <li key={item} className="inline-flex min-h-8 items-center gap-1.5 border border-white/[0.08] px-2.5 text-xs text-gray-300">
                    <Check className="h-3.5 w-3.5 text-primary-light" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
            <aside className="border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-light">Privacidad y alcance</p>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                No envíes contraseñas ni códigos de verificación por formularios o mensajes. Si un servicio requiere acceso a una cuenta o archivos, primero confirmaremos qué se necesita y cómo compartirlo. La asesoría puede orientar sobre reparar, actualizar o reemplazar; no implica compra, reventa ni reacondicionamiento de hardware.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
