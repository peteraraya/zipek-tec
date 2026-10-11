import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteConfig, features } from "@/config/site";
import FadeIn from "@/components/layout/FadeIn";

export default function LoginPage() {
  if (!features.enableClientPortal) return null;

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md px-4 sm:px-6 relative z-10">
        <FadeIn>
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block mb-8 text-gray-400 hover:text-white transition-colors">
              <span className="flex items-center text-sm font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </span>
            </Link>
            
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl shadow-primary/20">
                <Lock className="w-8 h-8 text-primary-light" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">Portal de <span className="text-gradient">Clientes</span></h1>
            <p className="text-gray-400">Accede al panel de seguimiento de tus proyectos y facturación en {siteConfig.name}.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Correo Corporativo</label>
                <Input 
                  type="email" 
                  placeholder="tu@empresa.com"
                  className="bg-black/20"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Contraseña</label>
                  <a href="#" className="text-xs text-primary hover:text-primary-light transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  className="bg-black/20"
                />
              </div>

              <div className="pt-2">
                <Button type="button" className="w-full py-6" size="lg">
                  Iniciar Sesión
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-gray-400">
                ¿No tienes cuenta activa? <br />
                Pídele acceso a tu Project Manager asignado.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}
