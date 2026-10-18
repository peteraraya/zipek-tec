import type { Metadata } from "next";
import PublicExperience from "@/components/experience/PublicExperience";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Centro digital",
  description: `Herramientas de orientación, preparación y seguimiento de servicios de ${siteConfig.name}.`,
};

export default function ExperiencePage() {
  return (
    <main className="flex-grow px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto mb-16 max-w-3xl text-center sm:mb-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-light">
            Tecnología útil, atención transparente
          </p>
          <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Tu servicio, más claro desde el primer paso.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
            Explora una orientación inicial, prepara una solicitud y conoce cómo cuidamos tu información. Sin diagnósticos automáticos ni costos sorpresa.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#orientacion" className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover">
              Explorar herramientas
            </a>
            <a href="#preparar" className="inline-flex min-h-11 items-center rounded-lg border border-white/15 px-5 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/5">
              Preparar mi equipo
            </a>
          </div>
        </header>
        <PublicExperience />
      </div>
    </main>
  );
}
