import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo/logo_zipek-tecnologia.png"
              alt="Zipek Tecnología Logo"
              width={48}
              height={48}
              className="rounded-full"
            />
            <span className="text-3xl font-bold tracking-tighter">
              <span className="text-white">zipek</span>
            </span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href={`https://wa.me/${siteConfig.contact.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              WhatsApp
            </a>
            <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white transition-colors">
              Correo
            </a>
            <span>{siteConfig.contact.location}</span>
          </div>
        </div>

        <div className="w-full h-px bg-white/10 mb-8" />

        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="text-sm text-gray-500 order-2 lg:order-1 text-center lg:text-left">
            &copy; {new Date().getFullYear()} {siteConfig.name}. Todos los derechos reservados.
          </div>

          <div className="flex gap-4 md:gap-6 text-sm flex-wrap justify-center items-center order-1 lg:order-2">
            <Link href="/privacidad" className="text-gray-500 hover:text-white transition-colors">
              Privacidad
            </Link>
            <Link href="/terminos" className="text-gray-500 hover:text-white transition-colors">
              Términos
            </Link>
            <Link href="/seguridad" className="text-gray-500 hover:text-white transition-colors">
              Seguridad
            </Link>
            <a href={`https://wa.me/${siteConfig.contact.phone.replace(/[^0-9]/g, "")}?text=Hola%2C%20quiero%20agendar%20un%20diagn%C3%B3stico.`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded-full bg-white/5 ml-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Atención por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
