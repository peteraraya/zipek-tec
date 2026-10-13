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
    <section id="planes" className="border-b border-white/[0.07] bg-background py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl sm:mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Atención y soporte</p>
          <h2 className="mt-3 text-3xl text-white md:text-4xl">
            Una propuesta clara antes de empezar.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-gray-400 sm:text-lg">
            Cuéntanos qué necesitas. Definimos contigo el alcance, el precio y las condiciones aplicables antes de autorizar cualquier trabajo.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
            La cotización puede depender de los equipos, tareas, modalidad, ubicación, repuestos y licencias. Te informamos si la revisión tiene costo antes de coordinar.
          </p>

          <div className="mt-7 inline-flex items-center gap-1 border-b border-white/15">
            <button
              type="button"
              aria-pressed={!isSupport}
              onClick={() => setIsSupport(false)}
              className={cn(
                "min-h-11 border-b-2 px-4 text-sm font-medium transition-colors",
                !isSupport ? "border-primary-light text-white" : "border-transparent text-gray-400 hover:text-white"
              )}
            >
              Hogar / Personas
            </button>
            <button
              type="button"
              aria-pressed={isSupport}
              onClick={() => setIsSupport(true)}
              className={cn(
                "min-h-11 border-b-2 px-4 text-sm font-medium transition-colors",
                isSupport ? "border-primary-light text-white" : "border-transparent text-gray-400 hover:text-white"
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
              className="relative flex flex-col rounded-none border-white/[0.1] bg-white/[0.018] shadow-none transition-colors hover:border-primary-light/40"
            >
              <CardHeader className="pb-7 pt-7">
                <CardTitle className="mb-2 text-xl text-gray-200">{plan.title}</CardTitle>
                <div className="flex min-h-12 items-center text-xl font-semibold text-white sm:text-2xl">{plan.price}</div>
                <CardDescription className="min-h-10 text-sm leading-6 text-gray-400">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <ul className="space-y-4">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" />
                      <span className="text-sm leading-6 text-gray-300">{feat}</span>
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

        <div className="mx-auto mt-12 max-w-5xl border-t border-white/15 pt-8 sm:mt-16">
          <h3 className="text-xl font-semibold text-white">Lo dejamos claro antes de empezar</h3>
          <ol className="mt-5 grid gap-5 sm:grid-cols-3">
            {[
              {
                title: "Caso y modalidad",
                description: "Aclaramos qué revisión se requiere, si tiene costo, y si podemos atender según zona y agenda.",
              },
              {
                title: "Alcance y costos",
                description: "Detallamos tareas incluidas, exclusiones y costos aplicables, como repuestos, licencias o traslado.",
              },
              {
                title: "Condiciones y autorización",
                description: "Acordamos canales y garantía aplicable. Solo empezamos con tu aprobación; los extras requieren nueva autorización.",
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
            Las tarjetas son ejemplos de tareas que pueden evaluarse, no paquetes con inclusiones automáticas. En soporte periódico se definen por propuesta los equipos, canales, horarios, visitas, tareas, exclusiones y agenda. No ofrecemos un tiempo de respuesta estándar ni garantía universal: las condiciones aplicables se informan para cada caso antes de autorizar.
          </p>
        </div>
      </div>
    </section>
  );
}
