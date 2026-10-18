

import Link from "next/link";
import { DatabaseBackup, FileCheck2, KeyRound, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function SeguridadPage() {
  const practices = [
    {
      icon: FileCheck2,
      title: "Trabajamos con autorización",
      description: "Antes de intervenir, dejamos claro qué trabajo se realizará y cuánto costará. Si hace falta algo más, te lo consultamos antes.",
    },
    {
      icon: DatabaseBackup,
      title: "Conversamos sobre tus respaldos",
      description: "Te ofrecemos respaldar los datos antes del trabajo. Si prefieres no hacerlo, dejamos constancia de esa decisión y del riesgo.",
    },
    {
      icon: KeyRound,
      title: "Acceso remoto solo contigo",
      description: "El acceso remoto se acuerda antes de iniciar, con el alcance y la herramienta que se usarán. No envíes contraseñas ni códigos por formularios o mensajería.",
    },
    {
      icon: ShieldCheck,
      title: "Software y copias bajo acuerdo",
      description: "No instalamos ni activamos software sin licencia. Si el trabajo requiere crear copias temporales, acordamos su finalidad, resguardo y devolución o eliminación al cerrar el caso.",
    },
  ];

  return (
    <main className="flex-grow px-4 pb-20 pt-32">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">{siteConfig.name}</p>
          <h1 className="mt-3 text-4xl font-bold text-white md:text-5xl">Cómo cuidamos tus datos y equipos</h1>
          <p className="mt-5 text-lg leading-relaxed text-gray-400">
            En cada servicio conversamos contigo sobre el acceso al equipo, tus archivos y el trabajo que autorizas.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {practices.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <Icon className="h-8 w-8 text-primary-light" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-semibold text-white">{title}</h2>
              <p className="mt-3 leading-relaxed text-gray-400">{description}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-gray-400">
          Si tienes preguntas sobre el uso de tus datos, revisa la{" "}
          <Link href="/privacidad" className="text-primary-light underline">política de privacidad</Link>.
        </p>
      </div>
    </main>
  );
}
