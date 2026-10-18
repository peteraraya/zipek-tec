import Link from "next/link";
import { ArrowRight, ScanSearch, ShieldCheck, Sparkles } from "lucide-react";

const highlights = [
  { icon: ScanSearch, title: "Orientación guiada", description: "Pasos iniciales claros, sin reemplazar la evaluación técnica." },
  { icon: Sparkles, title: "Solicitud preparada", description: "Ordena lo que necesitas conversar antes de pedir una cotización." },
  { icon: ShieldCheck, title: "Privacidad visible", description: "Conoce qué compartir y cómo cuidar tus datos." },
];

export default function DigitalExperienceTeaser() {
  return (
    <section aria-labelledby="digital-experience-title" className="border-b border-white/[0.07] bg-surface py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Centro digital</p>
          <h2 id="digital-experience-title" className="mt-3 text-3xl text-white sm:text-4xl">
            Más claridad, antes de conectar o entregar tu equipo.
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-gray-400">
            Herramientas sencillas para orientarte, preparar tu solicitud y entender cada paso del servicio.
          </p>
          <Link href="/experiencia" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
            Abrir Centro digital <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <Icon className="h-5 w-5 text-primary-light" aria-hidden="true" />
              <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-gray-400">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
