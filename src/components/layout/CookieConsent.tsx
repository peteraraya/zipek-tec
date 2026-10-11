"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { features } from "@/config/site";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check local storage for consent
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowConsent(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShowConsent(false);
  };

  if (!features.enableCookieBanner || !showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md">
      <div className="bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-white mb-2">Usamos Cookies 🍪</h3>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          Utilizamos cookies esenciales y analíticas para mejorar tu experiencia y cumplir con la legislación chilena vigente. Puedes configurar tu preferencia. Lee más en nuestra <Link href="/privacidad" className="text-primary hover:underline">Política de Privacidad</Link>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={acceptCookies} className="w-full sm:w-auto">
            Aceptar todas
          </Button>
          <Button onClick={declineCookies} variant="outline" className="w-full sm:w-auto">
            Rechazar opcionales
          </Button>
        </div>
      </div>
    </div>
  );
}
