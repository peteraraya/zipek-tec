"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CircleHelp,
  FileCheck2,
  Laptop,
  MapPin,
  MessageCircle,
  Monitor,
  Search,
  Wrench,
} from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: MessageCircle,
    title: "Nos cuentas",
    description: "Equipo, síntoma y desde cuándo ocurre.",
    outcome: "Orientación inicial",
  },
  {
    icon: Search,
    title: "Evaluamos",
    description: "Definimos modalidad y revisión necesaria.",
    outcome: "Costo de revisión informado antes",
  },
  {
    icon: FileCheck2,
    title: "Cotizamos",
    description: "Recibes tareas, límites y costos aplicables.",
    outcome: "Propuesta para aprobar",
  },
  {
    icon: Wrench,
    title: "Autorizas",
    description: "Empezamos solo con tu aprobación.",
    outcome: "Sin extras sin consultarte",
  },
  {
    icon: Laptop,
    title: "Probamos y entregamos",
    description: "Revisamos el resultado y te explicamos lo realizado.",
    outcome: "Resumen y condiciones acordadas",
  },
];

const servicePaths = [
  {
    id: "remota",
    icon: Monitor,
    title: "Atención remota",
    description: "Cuando el problema y el acceso permiten resolverlo a distancia.",
    nextStep: "Acordamos cómo conectarnos y qué revisar antes de iniciar.",
  },
  {
    id: "presencial",
    icon: MapPin,
    title: "Atención presencial",
    description: "En Quillota o por coordinar según ubicación y agenda.",
    nextStep: "Confirmamos disponibilidad, visita, traslado y costos antes de coordinar.",
  },
];

type ProcessFlowProps = {
  location: string;
};

export default function ProcessFlow({ location }: ProcessFlowProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const activePath = servicePaths.find((path) => path.id === selectedPath);

  return (
    <section aria-labelledby="process-flow-title" className="mt-14 border-t border-white/10 pt-10 sm:mt-16 sm:pt-12">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Así trabajamos</p>
          <h3 id="process-flow-title" className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            Cinco pasos, con tu aprobación.
          </h3>
        </div>
        <Link href="/consultas" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary-light hover:text-white">
          Cuéntanos tu caso <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="relative">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 hidden h-9 w-full lg:block"
          viewBox="0 0 1000 36"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M100 18H900"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary-light/50"
            pathLength={1}
            initial={shouldReduceMotion ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.9, ease: "easeOut" }}
          />
        </svg>

        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 h-full w-9 lg:hidden"
          viewBox="0 0 36 1000"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M18 18V1000"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary-light/40"
            pathLength={1}
            initial={shouldReduceMotion ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: shouldReduceMotion ? 0 : 1, ease: "easeOut" }}
          />
        </svg>

        <ol className="relative grid gap-y-3 lg:grid-cols-5 lg:gap-3">
          {steps.map(({ icon: Icon, title, description, outcome }, index) => (
            <motion.li
              key={title}
              className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 pb-3 lg:block lg:pb-0"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.35, delay: shouldReduceMotion ? 0 : index * 0.07 }}
            >
              <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-primary-light/40 bg-[#0a1120] text-xs font-semibold tabular-nums text-primary-light lg:mx-auto lg:mb-3">
                0{index + 1}
              </span>
              <div className="border border-white/[0.09] bg-white/[0.02] p-4 sm:p-5 lg:min-h-[14rem]">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-semibold text-white">{title}</h4>
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" aria-hidden="true" />
                </div>
                <p className="mt-2 text-sm leading-5 text-gray-400">{description}</p>
                <p className="mt-4 border-t border-white/[0.08] pt-3 text-xs leading-5 text-gray-300">
                  <span className="font-semibold text-primary-light">Resultado: </span>
                  {outcome}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>

      <div className="mt-10 grid gap-6 border-t border-white/10 pt-8 lg:grid-cols-[1fr_0.85fr] lg:gap-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Modalidad y evaluación</p>
          <h4 className="mt-2 text-xl font-semibold text-white">La ruta depende de tu caso.</h4>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            Selecciona una modalidad para ver qué conversaremos antes de coordinar. La evaluación determina si es adecuada para tu problema.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {servicePaths.map(({ id, icon: Icon, title, description }) => {
              const isSelected = selectedPath === id;

              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedPath(id)}
                  className={`min-h-32 border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light ${
                    isSelected
                      ? "border-primary-light/60 bg-primary-light/[0.08]"
                      : "border-white/[0.09] bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <Icon className="h-5 w-5 text-primary-light" aria-hidden="true" />
                    {isSelected && <Check className="h-4 w-4 text-primary-light" aria-hidden="true" />}
                  </span>
                  <span className="mt-3 block text-sm font-semibold text-white">{title}</span>
                  <span className="mt-1 block text-sm leading-5 text-gray-400">{description}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-5 text-gray-500">
            Atendemos en {location}; fuera de esa zona confirmamos disponibilidad. No publicamos plazos fijos: agenda y tiempos se acuerdan para cada solicitud.
          </p>
        </div>

        <div className="flex flex-col justify-between border-l-2 border-primary-light/50 bg-white/[0.025] p-5 sm:p-6">
          <div>
            <div className="flex items-center gap-2 text-primary-light">
              <CircleHelp className="h-4 w-4" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">Antes de coordinar</p>
            </div>
            <p className="mt-3 text-base font-semibold text-white">
              {activePath?.title ?? "¿Qué modalidad te acomoda?"}
            </p>
            <p aria-live="polite" className="mt-2 text-sm leading-6 text-gray-300">
              {activePath?.nextStep ??
                "Elige una opción. Confirmaremos si el problema, el acceso y la disponibilidad permiten esa ruta."}
            </p>
          </div>
          <p className="mt-5 border-t border-white/10 pt-4 text-sm leading-6 text-gray-400">
            Si hace falta un diagnóstico para cotizar, explicamos qué revisión se necesita y su costo antes de coordinar.
          </p>
        </div>
      </div>
    </section>
  );
}
