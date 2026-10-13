import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWhatsAppUrl, siteConfig } from "@/config/site";

export default function Hero() {
  const whatsappUrl = getWhatsAppUrl("Hola, necesito ayuda con mi computador.");

  return (
    <section id="inicio" className="border-b border-white/[0.07] py-14 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:gap-12 lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Soporte técnico · {siteConfig.contact.coverageArea}
          </p>

          <h1 className="text-[2.5rem] font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[4.25rem]">
            Soporte informático,{" "}
            <span className="text-primary-light">claro y cercano.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-gray-300 sm:text-lg sm:leading-[1.55]">
            Ayudamos a familias y negocios a resolver sus problemas informáticos.
            Revisamos, explicamos las opciones y acordamos el precio antes de empezar.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full gap-2 rounded-xl sm:w-auto">
              <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                Cuéntanos por WhatsApp
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full rounded-xl border-white/15 bg-transparent sm:w-auto">
              <Link href="/consultas">Enviar una consulta</Link>
            </Button>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-5 text-sm text-gray-300">
            {[
              "Precio acordado antes del trabajo",
              "Respaldo conversado contigo",
              "Alcance y condiciones por escrito",
            ].map((item) => (
              <div key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-light" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <Link href="#servicios-hogar" className="inline-flex min-h-11 items-center gap-2 text-gray-300 transition hover:text-primary-light">
              Necesito ayuda en casa
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="#servicios-pyme" className="inline-flex min-h-11 items-center gap-2 text-gray-300 transition hover:text-primary-light">
              Busco soporte para mi pyme
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mx-auto hidden w-full max-w-[430px] md:block">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#050914] p-3 shadow-[0_32px_80px_-48px_rgba(0,0,0,0.9)]">
            <Image
              src={siteConfig.logo}
              alt={`${siteConfig.name}: ${siteConfig.heroCaption}`}
              width={1280}
              height={1280}
              priority
              className="h-auto w-full rounded-[1.5rem]"
            />
          </div>
          <p className="mt-4 text-center text-xs font-medium uppercase tracking-[0.24em] text-gray-500">
            {siteConfig.heroCaption}
          </p>
        </div>
      </div>
    </section>
  );
}
