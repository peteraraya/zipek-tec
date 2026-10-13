

import { portfolioData, features } from "@/config/site";
import FadeIn from "@/components/layout/FadeIn";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function CasosDeExitoPage() {
  if (!features.enablePortfolio) notFound();

  return (
    <>
      <main className="flex-grow pt-32 pb-20">
        <FadeIn>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Casos de <span className="text-gradient">Éxito</span></h1>
              <p className="text-gray-400 text-lg">
                Proyectos reales, problemas reales, resultados reales. Descubre cómo hemos ayudado a empresas a escalar con tecnología.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolioData.map((item, idx) => (
                <Link key={idx} href={`/casos-de-exito/${item.slug}`} className="group relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 block">
                  <div className="aspect-[4/3] w-full bg-gradient-to-br from-white/5 to-white/10 relative overflow-hidden flex items-center justify-center p-8">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 w-full h-full bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 flex items-center justify-center shadow-2xl">
                      <span className="text-4xl font-bold text-white/20 tracking-tighter uppercase">{item.title.split(" ")[0]}</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map((tag, tagIdx) => (
                        <span key={tagIdx} className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-between group-hover:text-primary-light transition-colors">
                      {item.title}
                      <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>
      </main>
      </>
  );
}
