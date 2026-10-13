"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { features } from "@/config/site";

const subscribe = (callback: () => void) => {
  window.addEventListener("zipek-cookie-preferences", callback);
  window.addEventListener("zipek-cookie-consent-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("zipek-cookie-preferences", callback);
    window.removeEventListener("zipek-cookie-consent-change", callback);
    window.removeEventListener("storage", callback);
  };
};

const getSnapshot = () =>
  localStorage.getItem("cookie-consent") === null ||
  window.sessionStorage.getItem("zipek-cookie-preferences-open") === "true";

const getServerSnapshot = () => false;

export default function CookieConsent() {
  const showConsent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const saveChoice = (choice: "accepted" | "declined") => {
    localStorage.setItem("cookie-consent", choice);
    window.sessionStorage.removeItem("zipek-cookie-preferences-open");
    window.dispatchEvent(new Event("zipek-cookie-consent-change"));
  };

  if (!features.enableCookieBanner || !showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md sm:p-0">
      <div role="region" aria-labelledby="cookie-consent-title" className="rounded-2xl border border-white/10 bg-background/95 p-3 shadow-2xl backdrop-blur-xl sm:p-6">
        <h2 id="cookie-consent-title" className="mb-1 text-sm font-semibold text-white sm:mb-2 sm:text-lg">Preferencias de analítica</h2>
        <p className="mb-2 text-xs leading-relaxed text-gray-400 sm:mb-5 sm:text-sm">
          Vercel Analytics solo se activa si aceptas. Puedes cambiar tu decisión en el pie de página.{" "}
          <Link href="/privacidad" className="text-primary hover:underline">Privacidad</Link>.
        </p>
        <div className="flex gap-2 sm:gap-3">
          <Button onClick={() => saveChoice("accepted")} className="h-10 w-full px-3 text-xs sm:h-9 sm:px-4 sm:text-sm">
            Aceptar analítica
          </Button>
          <Button onClick={() => saveChoice("declined")} variant="outline" className="h-10 w-full px-3 text-xs sm:h-9 sm:px-4 sm:text-sm">
            No aceptar
          </Button>
        </div>
      </div>
    </div>
  );
}
