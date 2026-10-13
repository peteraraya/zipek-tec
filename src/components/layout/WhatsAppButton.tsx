"use client";

import { MessageCircle } from "lucide-react";
import { features, getWhatsAppUrl } from "@/config/site";

export default function WhatsAppButton() {
  if (!features.enableWhatsApp) return null;

  const whatsappUrl = getWhatsAppUrl("¡Hola! Quiero agendar un diagnóstico de mi equipo o consultar un servicio de soporte informático.");

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-primary text-white transition-all hover:-translate-y-1 hover:bg-primary-hover md:flex"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
