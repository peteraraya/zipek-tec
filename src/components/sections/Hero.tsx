import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RetroGrid } from "@/components/ui/retro-grid";

export default function Hero() {
  return (
    <section id="inicio" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <RetroGrid />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
            <ShieldCheck className="w-4 h-4 text-primary-light" />
            <span className="text-sm font-medium tracking-wider text-gray-300 uppercase">
              Soporte informático legal y cercano
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
            Equipos funcionando, seguros y con software <span className="text-gradient">legal.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto">
            ZIPEK Tecnología ofrece atención transparente para hogares y pymes: diagnóstico claro,
            precio cerrado antes de empezar, respaldo de datos y garantía por escrito.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto gap-2">
              <Link href="https://wa.me/56957642162?text=Hola%2C%20quiero%20agendar%20un%20diagn%C3%B3stico%20de%20mi%20equipo." target="_blank" rel="noreferrer">
                Agendar por WhatsApp
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="#servicios">Ver servicios</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-300">
            {[
              "Precio cerrado antes de empezar",
              "Respaldos y recuperación",
              "Soporte para hogares y pymes",
            ].map((item) => (
              <div key={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-primary-light" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
