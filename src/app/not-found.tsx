"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Home, ArrowLeft } from "lucide-react";
import FadeIn from "@/components/layout/FadeIn";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-2xl px-4 sm:px-6 relative z-10 text-center">
          <FadeIn>
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl shadow-primary/20">
                <Search className="w-12 h-12 text-primary-light" />
              </div>
            </div>

            <h1 className="text-7xl font-bold mb-4 tracking-tighter">
              4<span className="text-gradient">0</span>4
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Página no encontrada</h2>
            
            <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">
              Lo sentimos, la ruta que estás buscando no existe, ha sido movida o está temporalmente fuera de servicio.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto rounded-full px-8">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Ir al Inicio
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto rounded-full px-8 bg-white/5 hover:bg-white/10 border-white/10"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver atrás
              </Button>
            </div>
          </FadeIn>
        </div>
      </main>
      <Footer />
    </>
  );
}
