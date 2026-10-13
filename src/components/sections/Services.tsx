import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { siteConfig } from "@/config/site";

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

const complementaryGroups = [
  {
    title: "Equipos",
    summary: "Revisión, configuración y puesta en marcha",
    services: [
      {
        title: "Revisión preventiva",
        description: "Chequeo de actualizaciones, almacenamiento y estado general.",
        topic: "Revisión preventiva de equipos",
        includes: "Revisión visual y funcional acordada; observaciones sobre actualizaciones, almacenamiento y puntos de atención.",
        confirm: "Cantidad y tipo de equipos, modalidad, revisión requerida y cualquier reparación, repuesto o licencia, que se cotiza aparte si corresponde.",
        delivery: "Resumen de hallazgos y recomendaciones según lo revisado.",
      },
      {
        title: "Configuración de equipo nuevo",
        description: "Preparación de equipo, correo, impresora y aplicaciones.",
        topic: "Configuración de equipo nuevo",
        includes: "Configuración de las cuentas, actualizaciones, aplicaciones y periféricos que queden indicados en la propuesta.",
        confirm: "Compatibilidad, licencias, traslado de datos, accesorios y asistencia presencial; solo se incluyen si se especifican.",
        delivery: "Equipo configurado dentro del alcance y lista de tareas realizadas.",
      },
    ],
  },
  {
    title: "Datos",
    summary: "Respaldos, recuperación y migración",
    services: [
      {
        title: "Respaldo y recuperación",
        description: "Copia de archivos y prueba de recuperación, si es posible.",
        topic: "Respaldo y recuperación de archivos",
        includes: "Selección de archivos y origen/destino definidos contigo; copia o prueba de recuperación solo si el estado y acceso lo permiten.",
        confirm: "Accesos, capacidad del medio, costo de almacenamiento y límites técnicos. Un equipo con falla puede impedir recuperar datos.",
        delivery: "Registro de qué se copió y resultado de la comprobación acordada.",
      },
      {
        title: "Migración y orden digital",
        description: "Traslado planificado de archivos o cuentas entre equipos.",
        topic: "Migración y orden digital",
        includes: "Planificación y traslado de los archivos o cuentas identificados, si hay acceso y compatibilidad.",
        confirm: "Volumen de datos, claves/accesos, estado de origen y destino, licencias o espacio en la nube. No se garantiza recuperar información inaccesible.",
        delivery: "Resumen de elementos trasladados y de las limitaciones encontradas.",
      },
    ],
  },
  {
    title: "Seguridad digital",
    summary: "Prevención y configuración segura",
    services: [
      {
        title: "Seguridad digital cotidiana",
        description: "Actualizaciones, autenticación multifactor y hábitos seguros.",
        topic: "Seguridad digital",
        includes: "Orientación y ajustes concretos acordados, como actualizaciones o autenticación multifactor cuando el servicio lo permita.",
        confirm: "Cuentas, dispositivos y permisos involucrados. No es una certificación, monitoreo permanente ni garantía de ausencia de incidentes.",
        delivery: "Resumen de ajustes realizados y recomendaciones pendientes.",
      },
    ],
  },
  {
    title: "Pymes y capacitación",
    summary: "Inventario, soporte periódico y talleres",
    services: [
      {
        title: "Inventario y licencias",
        description: "Orden de equipos y software para planificar renovaciones.",
        topic: "Inventario y licencias para pyme",
        includes: "Levantamiento acordado de equipos y programas disponibles, con revisión básica del estado de licencias.",
        confirm: "Tamaño del inventario, documentación disponible y si necesitas una revisión o gestión adicional de licencias.",
        delivery: "Inventario revisado y lista de observaciones o prioridades.",
      },
      {
        title: "Soporte periódico para pymes",
        description: "Modalidad recurrente según equipos, tareas y cobertura.",
        topic: "Soporte periódico para pyme",
        includes: "Únicamente los equipos, tareas y modalidad que queden descritos en una propuesta aceptada.",
        confirm: "Canales y horarios, visitas, cobertura, agenda, costos, exclusiones y condiciones. No hay cantidad de visitas ni tiempo de respuesta estándar publicado.",
        delivery: "Resumen de trabajo según la periodicidad y formato que se acuerden.",
      },
      {
        title: "Acompañamiento y talleres",
        description: "Sesiones sobre herramientas, respaldos y prevención de fraudes.",
        topic: "Capacitación tecnológica",
        includes: "Sesión sobre tema, herramientas y participantes acordados previamente.",
        confirm: "Duración, lugar o modalidad remota, cantidad de asistentes y materiales requeridos.",
        delivery: "Orientación práctica; material adicional solo si se acuerda en la propuesta.",
      },
    ],
  },
];

const complementaryServices = complementaryGroups.flatMap((group) => group.services);

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
              Elige una opción y revisa su alcance. Cotizamos cada caso y te aclaramos qué incluye y qué no antes de autorizar.
            </p>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10 md:hidden">
            {complementaryGroups.map((group) => (
              <details key={group.title} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 marker:hidden">
                  <span className="min-w-0">
                    <span className="block font-semibold text-white">{group.title}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-gray-400">{group.summary}</span>
                  </span>
                  <span aria-hidden="true" className="shrink-0 text-xl text-primary-light transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="space-y-2 pb-3">
                  {group.services.map((service) => (
                    <details key={service.title} className="group/service border border-white/[0.08] bg-white/[0.02] px-3">
                      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-2 marker:hidden">
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-gray-100">{service.title}</span>
                          <span className="mt-0.5 block text-xs leading-5 text-gray-400">{service.description}</span>
                        </span>
                        <span aria-hidden="true" className="shrink-0 text-lg text-primary-light transition-transform group-open/service:rotate-45">+</span>
                      </summary>
                      <dl className="space-y-3 border-t border-white/10 py-3 text-xs leading-5">
                        <div>
                          <dt className="font-semibold text-white">Puede incluir</dt>
                          <dd className="mt-0.5 text-gray-400">{service.includes}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-white">Confirmamos antes</dt>
                          <dd className="mt-0.5 text-gray-400">{service.confirm}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-white">Recibes</dt>
                          <dd className="mt-0.5 text-gray-400">{service.delivery}</dd>
                        </div>
                      </dl>
                      <Link
                        href={`/consultas?tema=${encodeURIComponent(service.topic)}`}
                        className="mb-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary-light"
                      >
                        Consultar esta opción <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </details>
                  ))}
                </div>
              </details>
            ))}
          </div>

          <div className="hidden gap-3 md:grid md:grid-cols-2">
            {complementaryServices.map((service) => (
              <article key={service.title} className="border border-white/[0.09] bg-white/[0.02] p-4 sm:p-5">
                <h4 className="font-semibold text-white">{service.title}</h4>
                <p className="mt-2 text-sm leading-6 text-gray-400">{service.description}</p>
                <details className="group mt-4 border-t border-white/10 pt-3">
                  <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-primary-light marker:hidden">
                    Ver alcance orientativo
                    <span aria-hidden="true" className="text-lg transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <dl className="mt-3 space-y-3 text-sm leading-6">
                    <div>
                      <dt className="font-semibold text-white">Qué puede incluir</dt>
                      <dd className="mt-1 text-gray-400">{service.includes}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-white">Qué confirmamos antes</dt>
                      <dd className="mt-1 text-gray-400">{service.confirm}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-white">Qué recibes</dt>
                      <dd className="mt-1 text-gray-400">{service.delivery}</dd>
                    </div>
                  </dl>
                </details>
                <Link
                  href={`/consultas?tema=${encodeURIComponent(service.topic)}`}
                  className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary-light transition hover:text-white"
                >
                  Consultar esta opción <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-gray-500">
            Valores, disponibilidad, modalidad, costo de revisión y condiciones de garantía se informan por caso antes de autorizar. La asesoría puede orientar sobre reparar, actualizar o reemplazar; no implica compra, reventa ni reacondicionamiento de hardware.
          </p>
        </div>
      </div>
    </section>
  );
}
