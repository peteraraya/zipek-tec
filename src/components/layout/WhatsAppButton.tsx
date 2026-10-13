"use client";

import { MessageCircle } from "lucide-react";
import { features, siteConfig } from "@/config/site";

export default function WhatsAppButton() {
  if (!features.enableWhatsApp) return null;

  // Format phone number (remove spaces, plus, etc if needed) for the whatsapp URL
  const phoneNumber = siteConfig.contact.phone.replace(/[^0-9]/g, "");
  const message = encodeURIComponent("¡Hola! Quiero agendar un diagnóstico de mi equipo o consultar un servicio de soporte informático.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

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
