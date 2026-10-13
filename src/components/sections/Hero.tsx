import Link from "next/link";
import { ArrowDown, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RetroGrid } from "@/components/ui/retro-grid";
import { siteConfig } from "@/config/site";

export default function Hero() {
  const phone = siteConfig.contact.phone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent("Hola, necesito ayuda con mi computador.")}`;

  return (
    <section id="inicio" className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 opacity-40">
        <RetroGrid />
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/3 z-0 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[110px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
            <ShieldCheck className="w-4 h-4 text-primary-light" />
            <span className="text-sm font-medium tracking-wider text-gray-300 uppercase">
              Soporte técnico en Quillota y remoto
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            ¿Tu computador está dando problemas?{" "}
            <span className="text-gradient">Veamos qué necesita.</span>
          </h1>

          <p className="mx-auto mb-9 mt-6 max-w-2xl text-lg leading-relaxed text-gray-300 sm:text-xl">
            Ayudamos a familias y negocios de Quillota con soporte informático claro: primero revisamos,
            luego acordamos el precio y solo entonces empezamos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
              <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                Cuéntanos por WhatsApp
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/consultas">Enviar una consulta</Link>
            </Button>
          </div>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-300">
            {[
              "Precio acordado antes del trabajo",
              "Respaldo conversado contigo",
              "Informe y garantía por escrito",
            ].map((item) => (
              <div key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary-light" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            <Link
              href="#servicios-hogar"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-gray-300 transition hover:border-primary/50 hover:text-white"
            >
              Necesito ayuda en casa
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="#servicios-pyme"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-gray-300 transition hover:border-primary/50 hover:text-white"
            >
              Busco soporte para mi pyme
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
