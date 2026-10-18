import { methodologyData, features } from "@/config/site";
import { CheckCircle2 } from "lucide-react";

export default function Methodology() {
  if (!features.enableMethodology) return null;

  return (
    <section className="py-20 relative bg-background border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Nuestra <span className="text-gradient">Metodología</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Un proceso ordenado para acordar alcance, condiciones y próximos pasos contigo.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line for desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary-light/50 via-primary/50 to-transparent -translate-x-1/2" />
          
          <div className="space-y-12">
            {methodologyData.map((item, idx) => (
              <div key={idx} className="relative flex flex-col md:flex-row items-center gap-8 md:gap-16">
                
                {/* Desktop layout: alternate sides */}
                <div className={`w-full md:w-1/2 ${idx % 2 === 0 ? "md:text-right" : "md:order-3"}`}>
                  <div className={`bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors ${idx % 2 === 0 ? "md:mr-8" : "md:ml-8"}`}>
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3 justify-start md:justify-end">
                      {idx % 2 !== 0 && <span className="text-primary-light font-mono text-lg">{item.step}.</span>}
                      {item.title}
                      {idx % 2 === 0 && <span className="text-primary-light font-mono text-lg">.{item.step}</span>}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Center marker */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center justify-center w-12 h-12 rounded-full bg-background border-2 border-primary shadow-[0_0_15px_rgba(0,102,255,0.5)] z-10">
                  <CheckCircle2 className="w-5 h-5 text-primary-light" />
                </div>

                {/* Empty space for alignment */}
                <div className={`hidden md:block w-1/2 ${idx % 2 === 0 ? "order-3" : "order-1"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
