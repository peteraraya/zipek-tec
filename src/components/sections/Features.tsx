import Link from "next/link";
import { ClipboardCheck, FileText, MessageCircle, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function Features() {
  const steps = [
    {
      icon: MessageCircle,
      title: "Nos cuentas qué ocurre",
      description: "Por WhatsApp o el formulario web. Si es posible, cuéntanos qué equipo tienes y qué problema presenta.",
    },
    {
      icon: ClipboardCheck,
      title: "Revisamos y cotizamos",
      description: "Acordamos el trabajo y el precio antes de intervenir. Si aparece algo adicional, te consultamos primero.",
    },
    {
      icon: FileText,
      title: "Trabajamos con autorización",
      description: "Definimos el respaldo contigo y, al terminar, te entregamos un informe con el trabajo realizado y la garantía acordada.",
    },
  ];

  return (
    <section id="como-trabajamos" className="border-b border-white/[0.07] bg-[#0a1120] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl sm:mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">
            Sin sorpresas
          </p>
          <h2 className="mt-3 text-3xl text-white md:text-4xl">Un proceso transparente, paso a paso.</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
            Antes de empezar, sabes qué haremos, cuánto cuesta y qué pasará con tus datos.
          </p>
        </div>

        <ol className="grid gap-x-8 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="border-t border-white/15 py-6 sm:py-8">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium tabular-nums text-primary-light">0{index + 1}</span>
                <Icon className="h-4 w-4 text-gray-500" aria-hidden="true" />
              </div>
              <h3 className="mt-7 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 max-w-sm leading-7 text-gray-400">{description}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-400">
          <ShieldCheck className="h-5 w-5 text-primary-light" aria-hidden="true" />
          <span>Atención en {siteConfig.contact.location}. También coordinamos soporte remoto.</span>
          <Link href="/consultas" className="font-semibold text-primary-light underline underline-offset-4">
            Cuéntanos tu caso
          </Link>
        </div>
      </div>
    </section>
  );
}
