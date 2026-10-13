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

const complementaryServices = [
  {
    title: "Revisión preventiva",
    description: "Chequeo acordado de actualizaciones, almacenamiento, estado general y prioridades de mantenimiento.",
    topic: "Revisión preventiva de equipos",
    includes: "Revisión visual y funcional acordada; observaciones sobre actualizaciones, almacenamiento y puntos de atención.",
    confirm: "Cantidad y tipo de equipos, modalidad, revisión requerida y cualquier reparación, repuesto o licencia, que se cotiza aparte si corresponde.",
    delivery: "Resumen de hallazgos y recomendaciones según lo revisado.",
  },
  {
    title: "Respaldo y prueba de recuperación",
    description: "Revisamos qué información respaldar y, si el caso lo permite, comprobamos que pueda recuperarse.",
    topic: "Respaldo y recuperación de archivos",
    includes: "Selección de archivos y origen/destino definidos contigo; copia o prueba de recuperación solo si el estado y acceso lo permiten.",
    confirm: "Accesos, capacidad del medio, costo de almacenamiento y límites técnicos. Un equipo con falla puede impedir recuperar datos.",
    delivery: "Registro de qué se copió y resultado de la comprobación acordada.",
  },
  {
    title: "Inventario y licencias para pymes",
    description: "Orden de equipos y software, puntos por revisar y orientación para planificar renovaciones.",
    topic: "Inventario y licencias para pyme",
    includes: "Levantamiento acordado de equipos y programas disponibles, con revisión básica del estado de licencias.",
    confirm: "Tamaño del inventario, documentación disponible y si necesitas una revisión o gestión adicional de licencias.",
    delivery: "Inventario revisado y lista de observaciones o prioridades.",
  },
  {
    title: "Seguridad digital cotidiana",
    description: "Orientación y configuración según el caso: actualizaciones, autenticación multifactor y hábitos seguros.",
    topic: "Seguridad digital",
    includes: "Orientación y ajustes concretos acordados, como actualizaciones o autenticación multifactor cuando el servicio lo permita.",
    confirm: "Cuentas, dispositivos y permisos involucrados. No es una certificación, monitoreo permanente ni garantía de ausencia de incidentes.",
    delivery: "Resumen de ajustes realizados y recomendaciones pendientes.",
  },
  {
    title: "Configuración y puesta en marcha",
    description: "Preparación de un equipo nuevo, correo, impresora y aplicaciones dentro del alcance acordado.",
    topic: "Configuración de equipo nuevo",
    includes: "Configuración de las cuentas, actualizaciones, aplicaciones y periféricos que queden indicados en la propuesta.",
    confirm: "Compatibilidad, licencias, traslado de datos, accesorios y asistencia presencial; solo se incluyen si se especifican.",
    delivery: "Equipo configurado dentro del alcance y lista de tareas realizadas.",
  },
  {
    title: "Migración y orden digital",
    description: "Planificación del traslado de archivos y cuentas entre equipos, previa revisión de acceso y alcance.",
    topic: "Migración y orden digital",
    includes: "Planificación y traslado de los archivos o cuentas identificados, si hay acceso y compatibilidad.",
    confirm: "Volumen de datos, claves/accesos, estado de origen y destino, licencias o espacio en la nube. No se garantiza recuperar información inaccesible.",
    delivery: "Resumen de elementos trasladados y de las limitaciones encontradas.",
  },
  {
    title: "Acompañamiento y talleres",
    description: "Sesiones individuales o grupales sobre herramientas digitales, respaldos y prevención de fraudes.",
    topic: "Capacitación tecnológica",
    includes: "Sesión sobre tema, herramientas y participantes acordados previamente.",
    confirm: "Duración, lugar o modalidad remota, cantidad de asistentes y materiales requeridos.",
    delivery: "Orientación práctica; material adicional solo si se acuerda en la propuesta.",
  },
  {
    title: "Soporte periódico para pymes",
    description: "Conversamos una modalidad recurrente según cantidad de equipos, tareas, cobertura y agenda.",
    topic: "Soporte periódico para pyme",
    includes: "Únicamente los equipos, tareas y modalidad que queden descritos en una propuesta aceptada.",
    confirm: "Canales y horarios, visitas, cobertura, agenda, costos, exclusiones y condiciones. No hay cantidad de visitas ni tiempo de respuesta estándar publicado.",
    delivery: "Resumen de trabajo según la periodicidad y formato que se acuerden.",
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
            Atendemos a familias y negocios en {siteConfig.contact.city}. Cuéntanos el problema y te diremos si podemos ayudarte.
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

        <div className="mt-16 border-t border-white/10 pt-10 sm:mt-20 sm:pt-14">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-light">Más continuidad, a tu medida</p>
            <h3 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Servicios complementarios para conversar.</h3>
            <p className="mt-3 leading-7 text-gray-400">
              Elige una opción para ver qué podríamos considerar. Cada servicio se cotiza por caso; lo incluido y lo excluido queda definido antes de autorizar.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
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
