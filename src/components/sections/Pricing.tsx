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
            Atención clara, respaldo real y soporte pensado para hogares y pymes que necesitan equipos funcionando bien.
          </p>

          <div className="inline-flex items-center p-1 bg-white/5 border border-white/10 rounded-full">
            <button
              onClick={() => setIsSupport(false)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                !isSupport ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
              )}
            >
              Hogar / Personas
            </button>
            <button
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
              className={cn(
                "relative flex flex-col transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10",
                plan.recommended ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/10" : "border-white/10 bg-white/5"
              )}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Recomendado
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-xl text-gray-300 mb-2">{plan.title}</CardTitle>
                <div className="text-4xl font-bold text-white mb-4">{plan.price}</div>
                <CardDescription className="text-sm h-10 flex items-center justify-center text-gray-400">
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
                  variant={plan.recommended ? "default" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  <Link href="#contacto">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
