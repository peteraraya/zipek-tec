"use client";

import { useState } from "react";
import { Calculator, TrendingUp, Clock, DollarSign } from "lucide-react";
import { features } from "@/config/site";
import FadeIn from "@/components/layout/FadeIn";

export default function ROICalculator() {
  const [hours, setHours] = useState<number>(15);
  const [hourlyRate, setHourlyRate] = useState<number>(10000);

  if (!features.enableROICalculator) return null;

  // Calculos (52 weeks a year)
  const weeklyCost = hours * hourlyRate;
  const yearlyCost = weeklyCost * 52;
  const softwareCost = 1500000; // Estimated 1.5M for a custom automation software
  const roi = ((yearlyCost - softwareCost) / softwareCost) * 100;

  return (
    <section className="py-20 relative bg-background border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Calculadora de <span className="text-gradient">Retorno de Inversión</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Descubre cuánto dinero pierde tu empresa anualmente por tareas repetitivas y cómo un software a medida se paga solo.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-12">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            
            <div className="w-full lg:w-1/2 space-y-8">
              <div>
                <label className="flex justify-between text-sm font-medium text-gray-300 mb-4">
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Horas perdidas a la semana en procesos manuales</span>
                  <span className="text-primary-light font-bold text-lg">{hours} hrs</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-medium text-gray-300 mb-4">
                  <span className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> Valor promedio de la hora hombre (CLP)</span>
                  <span className="text-primary-light font-bold text-lg">${hourlyRate.toLocaleString("es-CL")}</span>
                </label>
                <input
                  type="range"
                  min="3000"
                  max="50000"
                  step="1000"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            <div className="w-full lg:w-1/2 bg-black/20 rounded-2xl p-8 border border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px]" />
              <h3 className="text-xl font-bold text-white mb-6">Tu realidad anual:</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Gasto anual en procesos manuales:</span>
                  <span className="text-2xl font-bold text-red-400">${yearlyCost.toLocaleString("es-CL")}</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <span className="text-gray-400">Costo estimado de automatización:</span>
                  <span className="text-lg font-medium text-gray-300">${softwareCost.toLocaleString("es-CL")}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/20 to-primary-light/10 border border-primary/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-primary-light" />
                  <span className="text-sm text-gray-300 font-medium uppercase tracking-wider">Ahorro Neto Primer Año</span>
                </div>
                <div className="text-4xl font-black text-white mb-2">
                  ${(yearlyCost - softwareCost).toLocaleString("es-CL")}
                </div>
                <p className="text-sm text-primary-light font-medium">
                  Un ROI del {Math.max(0, Math.round(roi))}% en el primer año.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
