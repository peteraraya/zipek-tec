import Link from "next/link";
import type { ReactElement } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ClipboardCheck,
  ListChecks,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  complementaryServiceGroups,
  complementaryServiceCount,
  type ComplementaryService,
  type ComplementaryServiceGroup,
} from "./complementary-services";

type ServiceScopeField = "includes" | "confirm" | "delivery";

const serviceScopeSteps: ReadonlyArray<{
  field: ServiceScopeField;
  icon: LucideIcon;
  label: string;
}> = [
  { field: "includes", icon: ListChecks, label: "Puede incluir" },
  { field: "confirm", icon: ClipboardCheck, label: "Confirmamos antes" },
  { field: "delivery", icon: PackageCheck, label: "Recibes" },
];

interface ServiceScopeDetailsProps {
  service: ComplementaryService;
}

/**
 * Presenta el alcance de un servicio en pasos compactos y fáciles de consultar.
 *
 * @param props Propiedades de alcance, incluyendo el servicio que se describe.
 * @returns Una lista descriptiva con inclusión, confirmación previa y entrega.
 */
function ServiceScopeDetails({ service }: ServiceScopeDetailsProps): ReactElement {
  return (
    <dl className="space-y-2 border-t border-white/10 py-3 text-xs leading-5 sm:text-sm">
      {serviceScopeSteps.map(({ field, icon: Icon, label }, index) => (
        <div
          key={field}
          className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 transition-colors hover:border-primary-light/20 motion-reduce:transition-none sm:grid-cols-[2rem_1.25rem_8.5rem_minmax(0,1fr)] sm:items-start"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-primary-light/20 bg-primary-light/[0.1] text-[10px] font-semibold tabular-nums text-primary-light sm:h-7 sm:w-7">
            0{index + 1}
          </span>
          <Icon
            className="col-start-1 row-start-2 mt-1 h-4 w-4 text-primary-light sm:col-start-2 sm:row-start-1 sm:mt-1.5"
            aria-hidden="true"
          />
          <dt className="col-start-2 row-start-1 self-center font-semibold text-white sm:col-start-3 sm:self-start">
            {label}
          </dt>
          <dd className="col-start-2 row-start-2 mt-1 text-gray-400 sm:col-start-4 sm:row-span-1 sm:row-start-1 sm:mt-0">
            {service[field]}
          </dd>
        </div>
      ))}
    </dl>
  );
}

interface ComplementaryServiceCardProps {
  service: ComplementaryService;
}

/**
 * Muestra una ficha de servicio con resumen, detalle opcional y enlace de consulta.
 *
 * @param props Propiedades de la ficha, incluyendo los datos del servicio.
 * @returns Una tarjeta de servicio complementario.
 */
function ComplementaryServiceCard({ service }: ComplementaryServiceCardProps): ReactElement {
  return (
    <article className="group/card flex flex-col rounded-xl border border-white/[0.09] bg-background/80 p-4 shadow-sm shadow-black/10 transition duration-200 motion-reduce:transition-none hover:-translate-y-0.5 hover:border-primary-light/25 hover:shadow-lg hover:shadow-black/15 sm:p-5">
      <div className="flex-1">
        <h5 className="font-semibold text-white">{service.title}</h5>
        <p className="mt-1.5 text-sm leading-6 text-gray-400">{service.description}</p>
      </div>
      <details className="group/scope mt-3 border-t border-white/10 pt-2">
        <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-2 text-sm font-medium text-primary-light transition-colors hover:bg-primary-light/[0.06] marker:hidden focus-visible:outline-2 focus-visible:outline-primary-light">
          <span>Ver alcance detallado</span>
          <ChevronDown
            className="h-4 w-4 transition-transform duration-200 group-open/scope:rotate-180 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </summary>
        <ServiceScopeDetails service={service} />
      </details>
      <Link
        href={`/consultas?tema=${encodeURIComponent(service.topic)}`}
        className="mt-2 inline-flex min-h-10 items-center gap-2 self-start rounded-lg px-2 text-sm font-semibold text-primary-light transition-colors hover:bg-primary-light/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light motion-reduce:transition-none"
      >
        Consultar esta opción
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover/card:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </Link>
    </article>
  );
}

interface ComplementaryServiceCategoryProps {
  group: ComplementaryServiceGroup;
  index: number;
}

/**
 * Renderiza una categoría plegable con sus servicios complementarios.
 *
 * @param props Datos de la categoría y posición usada para numerarla.
 * @returns Una categoría desplegable con sus fichas de servicio.
 */
function ComplementaryServiceCategory({
  group,
  index,
}: ComplementaryServiceCategoryProps): ReactElement {
  const Icon = group.icon;

  return (
    <details
      open={index === 0}
      className="group overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.018] shadow-sm shadow-black/10 transition-colors open:border-primary-light/30 open:bg-white/[0.03] motion-reduce:transition-none"
    >
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 p-4 marker:hidden transition-colors hover:bg-white/[0.035] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-light motion-reduce:transition-none sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary-light/25 bg-gradient-to-br from-primary-light/[0.16] to-secondary/[0.12] text-primary-light shadow-inner shadow-primary-light/[0.06]">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[10px] font-semibold tracking-[0.14em] text-primary-light/80">
                0{index + 1}
              </span>
              <h4 className="font-semibold text-white">{group.title}</h4>
            </div>
            <div className="mt-1 text-xs leading-5 text-gray-400 sm:text-sm">{group.summary}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {group.services.map((service) => (
                <span
                  key={service.title}
                  className="rounded-md border border-white/[0.08] bg-black/[0.08] px-2 py-1 text-[10px] leading-4 text-gray-300 sm:text-[11px]"
                >
                  {service.title}
                </span>
              ))}
            </div>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-3">
          <span className="hidden rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-gray-400 sm:inline">
            {group.services.length} {group.services.length === 1 ? "servicio" : "servicios"}
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
            <ChevronDown
              className="h-4 w-4 text-primary-light transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </span>
        </span>
      </summary>

      <div className="grid gap-3 border-t border-white/[0.08] bg-black/[0.08] px-3 pb-3 pt-3 sm:grid-cols-2 sm:px-4 sm:pb-4">
        {group.services.map((service) => (
          <ComplementaryServiceCard key={service.title} service={service} />
        ))}
      </div>
    </details>
  );
}

/**
 * Presenta el catálogo complementario agrupado por área y sus condiciones generales.
 *
 * La sección usa componentes de servidor y controles HTML nativos, por lo que no
 * necesita estado React, hooks de memoización ni JavaScript de cliente.
 *
 * @returns La sección de servicios complementarios y sus notas de alcance.
 */
export default function ComplementaryServices(): ReactElement {
  return (
    <section aria-labelledby="complementary-services-title">
      <div className="relative mb-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:mb-8 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 right-1/3 h-36 w-36 rounded-full bg-secondary/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary-light/20 bg-primary-light/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-light">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Más apoyo, a tu medida
            </p>
            <h3
              id="complementary-services-title"
              className="mt-4 text-2xl font-semibold text-white sm:text-3xl"
            >
              Servicios complementarios
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400 sm:text-base sm:leading-7">
              Soluciones adicionales para equipos, datos, seguridad y negocios. Revisa el alcance de cada
              una; costos y condiciones se acuerdan antes de autorizar.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-gray-300 sm:pb-1">
            <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
              <span className="font-semibold text-white">{complementaryServiceGroups.length}</span> áreas
            </span>
            <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
              <span className="font-semibold text-white">{complementaryServiceCount}</span> servicios
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {complementaryServiceGroups.map((group, index) => (
          <ComplementaryServiceCategory key={group.title} group={group} index={index} />
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <aside className="rounded-2xl border border-white/[0.09] bg-white/[0.02] p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-light">
            Antes de comenzar
          </p>
          <p className="mt-1 text-sm text-gray-400">Confirmamos contigo:</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {["Valores", "Disponibilidad", "Modalidad", "Costo de revisión", "Condiciones de garantía"].map(
              (item) => (
                <li
                  key={item}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.025] px-2.5 text-xs text-gray-300"
                >
                  <Check className="h-3.5 w-3.5 text-primary-light" aria-hidden="true" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </aside>
        <aside className="rounded-2xl border border-primary-light/15 bg-primary-light/[0.035] p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-light">
            Privacidad y alcance
          </p>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            No envíes contraseñas ni códigos de verificación por formularios o mensajes. Si un servicio
            requiere acceso a una cuenta o archivos, primero confirmaremos qué se necesita y cómo
            compartirlo. La asesoría puede orientar sobre reparar, actualizar o reemplazar; no implica
            compra, reventa ni reacondicionamiento de hardware.
          </p>
        </aside>
      </div>
    </section>
  );
}
