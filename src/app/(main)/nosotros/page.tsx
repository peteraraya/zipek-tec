

import { siteConfig, features } from "@/config/site";
import { notFound } from "next/navigation";
import { Users, Target, Rocket } from "lucide-react";
import FadeIn from "@/components/layout/FadeIn";
import Image from "next/image";

export default function NosotrosPage() {
  if (!features.enableAboutUs) notFound();

  return (
    <>
      <main className="flex-grow pt-32 pb-20">
        <FadeIn>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Quiénes <span className="text-gradient">Somos</span></h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                En {siteConfig.name}, no somos solo una agencia de desarrollo. Somos tu socio tecnológico. 
                Nacimos con la misión de democratizar el acceso a software de calidad corporativa para las pequeñas y medianas empresas de Chile y Latinoamérica.
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-primary/50 transition-colors">
                <Target className="w-10 h-10 text-primary-light mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Nuestra Misión</h3>
                <p className="text-gray-400">
                  Transformar negocios tradicionales en máquinas de eficiencia digital, entregando soluciones rentables, escalables y seguras.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-primary/50 transition-colors">
                <Users className="w-10 h-10 text-primary-light mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Cercanía y Transparencia</h3>
                <p className="text-gray-400">
                  Hablamos tu idioma, sin tecnicismos innecesarios. Trabajamos bajo contratos claros, SLAs definidos y entregas por hitos.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-primary/50 transition-colors">
                <Rocket className="w-10 h-10 text-primary-light mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Innovación Constante</h3>
                <p className="text-gray-400">
                  Utilizamos tecnologías de punta (React, Next.js, Cloud Computing) que tradicionalmente estaban reservadas solo para grandes corporaciones.
                </p>
              </div>
            </div>

            {/* Team / Founder Profile */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 md:p-16 border border-white/10 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                {/* Image Placeholder / Avatar */}
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-tr from-primary to-secondary flex-shrink-0 p-1">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden relative">
                    <Users className="w-16 h-16 text-primary-light absolute z-0" />
                    <Image src="/img/pedroaraya.png" alt="Pedro Araya" width={224} height={224} className="w-full h-full object-cover opacity-80 relative z-10" />
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold text-white mb-2">Pedro Araya Gálvez</h2>
                  <div className="text-primary-light font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
                    <span>CEO & Lead Full Stack Developer</span>
                    <span className="w-1 h-1 bg-gray-500 rounded-full" />
                    <span className="text-gray-400 text-sm">Quillota, Chile</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-6 max-w-2xl">
                    &ldquo;Creo en la creación de software robusto, que solucione problemas reales sin sobrecomplicar la arquitectura.&rdquo;
                    <br /><br />
                    Con años de experiencia *end-to-end* implementando tecnologías como React, Node.js, NestJS y ecosistemas Serverless (AWS, Supabase), dirijo {siteConfig.shortName} con un objetivo claro: trasladar el estándar de calidad de la gran industria directamente a las pymes y empresas emergentes.
                  </p>
                  
                  <div className="flex gap-4 justify-center md:justify-start">
                    <a href="https://www.linkedin.com/in/pedro-araya-galvez/" target="_blank" rel="noopener noreferrer" className="px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 text-white text-sm font-medium transition-colors">
                      LinkedIn
                    </a>
                    <a href="https://github.com/peteraraya" target="_blank" rel="noopener noreferrer" className="px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 text-white text-sm font-medium transition-colors">
                      GitHub
                    </a>
                    <a href="https://pedroaraya.vercel.app/" target="_blank" rel="noopener noreferrer" className="px-5 py-2 rounded-full border border-white/20 hover:bg-white/10 text-white text-sm font-medium transition-colors">
                      Portfolio
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </main>
      </>
  );
}
