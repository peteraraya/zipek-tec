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
    <section id="como-trabajamos" className="border-y border-white/5 bg-background/50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">
            Sin sorpresas
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
            Así trabajamos
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-400">
            Antes de empezar, sabes qué haremos, cuánto cuesta y qué pasará con tus datos.
          </p>
        </div>

        <ol className="grid gap-5 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-light">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-gray-500">
                Paso {index + 1}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 leading-relaxed text-gray-400">{description}</p>
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
