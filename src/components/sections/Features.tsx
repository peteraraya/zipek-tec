import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export default function Features() {
  return (
    <section id="soluciones" className="py-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <div className="w-full lg:w-1/2 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Tecnología que <br />
              <span className="text-gradient">impulsa tu pyme</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Sabemos que cada negocio es único. Por eso, diseñamos soluciones a medida que optimizan tus operaciones, reducen costos y aumentan tu productividad.
            </p>
            
            <ul className="space-y-4 mb-10">
              {[
                "Automatización de procesos manuales",
                "Gestión centralizada de datos e inventarios",
                "Integración con plataformas de pago y CRM",
                "Métricas y reportes en tiempo real"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
            
            <Button asChild variant="ghost" size="lg" className="rounded-full border border-white/20">
              <Link href="#contacto">
                Conoce más
              </Link>
            </Button>
          </div>
          
          <div className="w-full lg:w-1/2 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl blur-2xl transform rotate-3" />
            <div className="relative bg-[#0F172A] border border-white/10 rounded-3xl p-8 shadow-2xl">
              {/* Mock Dashboard UI */}
              <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-sm font-mono text-gray-500">{siteConfig.name.split(" ")[0]} Dashboard</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-sm text-gray-400 mb-1">Crecimiento</div>
                  <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                    +75% <span className="text-xs text-green-400">↑ este mes</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-sm text-gray-400 mb-1">Eficiencia</div>
                  <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                    99.9% <span className="text-xs text-primary-light">óptimo</span>
                  </div>
                </div>
              </div>
              
              <div className="h-32 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 border border-white/5 flex items-end p-4 gap-2">
                {[40, 60, 45, 80, 55, 90, 75].map((height, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-gradient-to-t from-primary to-primary-light rounded-t-sm opacity-80"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
