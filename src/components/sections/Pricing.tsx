"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { pricingData, supportPricingData, features } from "@/config/site";
import { cn } from "@/lib/utils";

export default function Pricing() {
  const [isSupport, setIsSupport] = useState(false);

  if (!features.enablePricing) return null;

  const currentData = isSupport ? supportPricingData : pricingData;

  return (
    <section id="planes" className="py-20 relative bg-background/50 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planes para <span className="text-gradient">tu tranquilidad</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Opciones para una atención puntual o soporte periódico. Te confirmamos el alcance y el precio antes de empezar.
          </p>
          <p className="mx-auto -mt-3 mb-8 max-w-2xl text-sm leading-relaxed text-gray-500">
            Los valores dependen del equipo, el trabajo necesario y, cuando corresponda, repuestos o desplazamiento.
            Consulta si la revisión tiene costo y qué incluye cada servicio antes de coordinar.
          </p>

          <div className="inline-flex items-center p-1 bg-white/5 border border-white/10 rounded-full">
            <button
              type="button"
              aria-pressed={!isSupport}
              onClick={() => setIsSupport(false)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                !isSupport ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
              )}
            >
              Hogar / Personas
            </button>
            <button
              type="button"
              aria-pressed={isSupport}
              onClick={() => setIsSupport(true)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                isSupport ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
              )}
            >
              Pyme / Empresas
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {currentData.map((plan, idx) => (
            <Card
              key={idx}
              className="relative flex flex-col border-white/10 bg-white/5 transition-colors hover:border-primary/40"
            >
              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-xl text-gray-300 mb-2">{plan.title}</CardTitle>
                <div className="min-h-16 flex items-center justify-center text-2xl font-bold text-white sm:text-3xl">{plan.price}</div>
                <CardDescription className="min-h-10 text-sm text-gray-400">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <ul className="space-y-4">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-gray-300 text-sm leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-8">
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Link href={`/consultas?tema=${encodeURIComponent(plan.title)}`}>{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-5xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <h3 className="text-xl font-semibold text-white">Qué confirmamos antes de empezar</h3>
          <ol className="mt-5 grid gap-5 sm:grid-cols-3">
            {[
              {
                title: "Revisión y disponibilidad",
                description: "Aclaramos el problema, la modalidad de atención y si corresponde un costo de revisión o visita.",
              },
              {
                title: "Alcance y costos",
                description: "Te explicamos el trabajo propuesto y los costos que correspondan, incluidos repuestos o licencias.",
              },
              {
                title: "Tu autorización",
                description: "Solo comenzamos con tu aprobación. Si surge un trabajo adicional, te consultamos antes.",
              },
            ].map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary-light">
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-medium text-white">{step.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-gray-400">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-relaxed text-gray-500">
            Las tarjetas describen servicios que podemos cotizar; no representan una tarifa fija ni confirman disponibilidad.
            El alcance, exclusiones, garantía y condiciones aplicables se acuerdan para cada caso.
          </p>
        </div>
      </div>
    </section>
  );
}
