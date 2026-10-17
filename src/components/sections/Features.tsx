import Image from "next/image";
import { Check, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import ProcessFlow from "@/components/sections/ProcessFlow";

const checklist = [
  "Qué ocurre y cuándo comenzó.",
  "Marca/modelo, si lo tienes a mano.",
  "Si hay archivos importantes que debamos considerar.",
  "No envíes contraseñas por el formulario.",
];

const checklistFile = encodeURIComponent(
  `Antes de consultar a ${siteConfig.name}\n\n${checklist.map((item) => `- ${item}`).join("\n")}\n`,
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
            <div className="features-image-caption absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl border border-white/10 bg-[#080d19]/90 p-3 backdrop-blur">
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

        <ProcessFlow city={siteConfig.contact.city} />

        <div className="mt-10 border-t border-white/10 pt-8">
          <aside className="max-w-3xl border border-white/[0.09] bg-white/[0.02] p-5 sm:p-6">
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
