import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import CookiePreferencesButton from "@/components/layout/CookiePreferencesButton";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-background pt-14 pb-8 sm:pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo/logo_zipek-tecnologia.png"
              alt="Zipek Tecnología Logo"
              width={48}
              height={48}
              className="rounded-full"
            />
            <span className="text-3xl font-semibold tracking-[-0.035em]">
              <span className="text-white">zipek</span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-400 md:justify-end">
            <a href={`https://wa.me/${siteConfig.contact.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              WhatsApp
            </a>
            <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white transition-colors">
              Correo
            </a>
            <span>{siteConfig.contact.location}</span>
          </div>
        </div>

        <div className="mb-8 h-px w-full bg-white/10" />

        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="text-sm text-gray-500 order-2 lg:order-1 text-center lg:text-left">
            &copy; {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
          </div>

          <div className="order-1 flex flex-wrap items-center justify-center gap-4 text-sm md:gap-6 lg:order-2">
            <Link href="/privacidad" className="text-gray-500 hover:text-white transition-colors">
              Privacidad
            </Link>
            <Link href="/terminos" className="text-gray-500 hover:text-white transition-colors">
              Términos
            </Link>
            <Link href="/seguridad" className="text-gray-500 hover:text-white transition-colors">
              Seguridad
            </Link>
            <CookiePreferencesButton />
            <a href={`https://wa.me/${siteConfig.contact.phone.replace(/[^0-9]/g, "")}?text=Hola%2C%20necesito%20ayuda%20con%20un%20equipo.`} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-1.5 text-gray-400 transition-colors hover:border-primary-light/40 hover:text-white">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
