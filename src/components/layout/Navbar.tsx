"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navLinks, features } from "@/config/site";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav aria-label="Navegación principal" className="fixed top-0 z-50 w-full border-b border-white/10 bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logo/logo_zipek-tecnologia.png" 
                alt="Zipek Tecnología Logo" 
                width={40} 
                height={40} 
                className="rounded-full"
              />
              <span className="text-2xl font-bold tracking-tighter hidden sm:block">
                <span className="text-white">zipek</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden xl:block">
            <div className="ml-6 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.title}
                    href={link.href}
                    className="hover:text-primary-light hover:bg-white/5 transition-colors px-3 py-2 rounded-full text-sm font-medium text-gray-300"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
              
              <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                {features.enableClientPortal && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 opacity-60 cursor-not-allowed bg-white/5" title="Disponible próximamente">
                    Portal
                    <span className="bg-primary/20 text-primary-light text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Pronto</span>
                  </div>
                )}
                <ThemeToggle />
                <Button asChild className="rounded-full px-5 font-medium shadow-lg shadow-primary/20">
                  <Link href="/consultas">Enviar consulta</Link>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 xl:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 text-gray-300 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div id="mobile-navigation" hidden={!isOpen} className="border-b border-white/10 bg-background xl:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.title}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary-light"
                onClick={() => setIsOpen(false)}
              >
                {link.title}
              </Link>
            ))}
            {features.enableClientPortal && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-500 border border-white/5 my-2 cursor-not-allowed">
                Portal Clientes
                <span className="bg-primary/20 text-primary-light text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">Pronto</span>
              </div>
            )}
            <Link
              href="/consultas"
              className="block rounded-md px-3 py-2 font-medium text-primary-light hover:bg-white/5"
              onClick={() => setIsOpen(false)}
            >
              Enviar consulta
            </Link>
          </div>
      </div>
    </nav>
  );
}
