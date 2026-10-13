"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { faqData, features } from "@/config/site";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!features.enableFAQ) return null;

  return (
    <section id="faq" className="border-b border-white/[0.07] bg-background py-20 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 sm:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Información</p>
          <h2 className="mt-3 text-3xl text-white md:text-4xl">Preguntas frecuentes.</h2>
          <p className="mt-4 text-base leading-7 text-gray-400 sm:text-lg">
            Resolvemos tus dudas sobre cómo trabajamos y qué puedes esperar.
          </p>
        </div>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index} 
                className="overflow-hidden"
              >
                <button
                  type="button"
                  id={`faq-trigger-${index}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                  className="flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left focus:outline-none"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="font-medium text-white sm:text-lg">{faq.question}</span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} 
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${index}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="max-w-2xl pb-6 pr-10 leading-7 text-gray-400">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
