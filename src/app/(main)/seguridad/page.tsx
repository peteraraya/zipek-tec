

import { Shield, Lock, Server, Cloud } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function SeguridadPage() {
  return (
    <>
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Seguridad y <span className="text-gradient">Arquitectura</span></h1>
            <p className="text-gray-400 text-lg">
              En {siteConfig.name}, la seguridad de la información no es una característica opcional, es la base de todos nuestros desarrollos corporativos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <Shield className="w-10 h-10 text-primary-light mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Protección de Datos</h3>
              <p className="text-gray-400">
                Toda la información viaja encriptada bajo estándares TLS 1.3. Las contraseñas se almacenan mediante algoritmos de hashing robustos (Bcrypt/Argon2) y cumplimos con los lineamientos de la Ley 19.628 de Chile.
              </p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <Lock className="w-10 h-10 text-primary-light mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Autenticación Segura</h3>
              <p className="text-gray-400">
                Implementamos flujos de autenticación modernos, soporte para Single Sign-On (SSO), OAuth2, y Multi-Factor Authentication (MFA) para paneles administrativos críticos.
              </p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <Server className="w-10 h-10 text-primary-light mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Respaldos Automáticos</h3>
              <p className="text-gray-400">
                Configuramos políticas de respaldos (Backups) diarios automatizados para bases de datos transaccionales, asegurando un punto de restauración en caso de desastres (Disaster Recovery).
              </p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <Cloud className="w-10 h-10 text-primary-light mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Arquitectura Cloud</h3>
              <p className="text-gray-400">
                Desplegamos en entornos de nube de clase mundial (AWS, Vercel, Google Cloud) garantizando un 99.9% de Uptime, autoescalado ante picos de tráfico y defensa contra ataques DDoS.
              </p>
            </div>
          </div>

        </div>
      </main>
      </>
  );
}
