import Image from "next/image";
import Link from "next/link";
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
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { siteConfig } from "@/config/site";

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
    icon: Monitor,
    title: "Atención remota",
    description: "Cuando el problema y el acceso permiten resolverlo a distancia. Acordamos antes cómo conectarnos.",
  },
  {
    icon: MapPin,
    title: "Atención presencial",
    description: "En Quillota o por coordinar según ubicación y agenda. Visita, traslado y costos se confirman antes.",
  },
  {
    icon: CircleHelp,
    title: "¿Hace falta revisar?",
    description: "Si no es posible cotizar sin diagnóstico, explicamos qué se necesita y su costo antes de coordinar.",
  },
];

const checklist = [
  "Qué ocurre y cuándo comenzó.",
  "Marca/modelo, si lo tienes a mano.",
  "Si hay archivos importantes que debamos considerar.",
  "No envíes contraseñas por el formulario.",
];

const checklistFile = encodeURIComponent(
  `Antes de consultar a ZIPEK Tecnología\n\n${checklist.map((item) => `- ${item}`).join("\n")}\n`,
);

export default function Features() {
  return (
    <section id="como-trabajamos" className="border-b border-white/[0.07] bg-[#0a1120] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1524]">
            <Image
              src="/images/zipek-soporte-cercano.svg"
              alt="Una persona de soporte y una clienta revisan juntos un computador"
              width={960}
              height={700}
              priority={false}
              className="h-auto w-full"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl border border-white/10 bg-[#080d19]/90 p-3 backdrop-blur">
              <ShieldCheck className="h-5 w-5 shrink-0 text-primary-light" aria-hidden="true" />
              <p className="text-sm leading-5 text-gray-200">Conversamos cada paso contigo antes de intervenir.</p>
            </div>
          </div>

          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Sin sorpresas</p>
            <h2 className="mt-3 text-3xl text-white md:text-4xl">Primero lo entendemos. Después decides.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-gray-400">
              Te explicamos opciones, costos y condiciones antes de empezar. Si cambia el alcance, pausamos y lo conversamos contigo.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-gray-300">
              {["Precio acordado", "Respaldo conversado", "Sin extras no autorizados"].map((item) => (
                <span key={item} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3">
                  <Check className="h-3.5 w-3.5 text-primary-light" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-10 sm:mt-16 sm:pt-12">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Así trabajamos</p>
              <h3 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Cinco pasos, con tu aprobación.</h3>
            </div>
            <Link href="/consultas" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary-light hover:text-white">
              Cuéntanos tu caso <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map(({ icon: Icon, title, description, outcome }, index) => (
              <li key={title} className="relative border border-white/[0.09] bg-white/[0.02] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tabular-nums tracking-widest text-primary-light">0{index + 1}</span>
                  <Icon className="h-4 w-4 text-primary-light" aria-hidden="true" />
                </div>
                <h4 className="mt-4 font-semibold text-white">{title}</h4>
                <p className="mt-1 text-sm leading-5 text-gray-400">{description}</p>
                <p className="mt-4 border-t border-white/[0.08] pt-3 text-xs leading-5 text-gray-300">
                  <span className="font-semibold text-primary-light">Resultado: </span>{outcome}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-12 grid gap-8 border-t border-white/10 pt-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Modalidad y evaluación</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">La ruta depende de tu caso.</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {servicePaths.map(({ icon: Icon, title, description }) => (
                <article key={title} className="border-l-2 border-primary-light/50 bg-white/[0.025] p-4">
                  <Icon className="h-5 w-5 text-primary-light" aria-hidden="true" />
                  <h4 className="mt-3 text-sm font-semibold text-white">{title}</h4>
                  <p className="mt-2 text-xs leading-5 text-gray-400">{description}</p>
                </article>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-gray-500">
              Atendemos en {siteConfig.contact.location}; fuera de esa zona confirmamos disponibilidad. No publicamos plazos fijos: agenda y tiempos se acuerdan para cada solicitud.
            </p>
          </div>

          <aside className="border border-white/[0.09] bg-white/[0.02] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-light">Para agilizar la consulta</p>
                <h3 className="mt-1 font-semibold text-white">Ten a mano estos datos</h3>
              </div>
              <a
                href={`data:text/plain;charset=utf-8,${checklistFile}`}
                download="lista-previa-zipek.txt"
                className="inline-flex min-h-9 items-center gap-2 text-xs font-semibold text-primary-light underline underline-offset-4 hover:text-white"
              >
                Descargar lista
              </a>
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs leading-5 text-gray-300">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-light" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
