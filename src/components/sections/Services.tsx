import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

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
      "Soporte remoto y visitas programadas.",
      "Inventario de equipos y recomendaciones de compra.",
    ],
  },
];

export default function Services() {
  return (
    <section id="servicios" className="bg-background/50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">Soporte informático</p>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">¿En qué te podemos ayudar?</h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-400">
            Atendemos a familias y negocios en Quillota. Cuéntanos el problema y te diremos si podemos ayudarte.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {servicesForHome.map((group) => (
            <article id={group.id} key={group.title} className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <p className="text-sm font-medium text-primary-light">{group.audience}</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{group.title}</h3>
              <p className="mt-3 min-h-14 leading-relaxed text-gray-400">{group.description}</p>
              <ul className="mt-6 space-y-4">
                {group.services.map((service) => (
                  <li key={service} className="flex items-start gap-3 leading-relaxed text-gray-300">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-primary-light" aria-hidden="true" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
              <Link href={`/consultas?tema=${encodeURIComponent(group.title)}`} className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary-light hover:text-white">
                Consultar por este servicio <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
