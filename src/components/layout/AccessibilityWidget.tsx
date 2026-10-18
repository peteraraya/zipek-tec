"use client";

import { useState, useEffect } from "react";
import { Accessibility, Type, Contrast, Palette, Link as LinkIcon, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AccessibilitySettings = {
  textSize: 0 | 1 | 2;
  highContrast: boolean;
  grayscale: boolean;
  underlineLinks: boolean;
  readableSpacing: boolean;
};

const defaultSettings: AccessibilitySettings = {
  textSize: 0,
  highContrast: false,
  grayscale: false,
  underlineLinks: false,
  readableSpacing: false,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseSettings(value: string | null): AccessibilitySettings {
  if (!value) return defaultSettings;

  const parsed: unknown = JSON.parse(value);
  if (!isRecord(parsed)) return defaultSettings;

  const textSize = parsed.textSize === 1 || parsed.textSize === 2 ? parsed.textSize : 0;

  return {
    textSize,
    highContrast: parsed.highContrast === true,
    grayscale: parsed.grayscale === true,
    underlineLinks: parsed.underlineLinks === true,
    readableSpacing: parsed.readableSpacing === true || parsed.dyslexia === true,
  };
}

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window === "undefined") return defaultSettings;

    try {
      return parseSettings(window.localStorage.getItem("a11y-settings"));
    } catch (error) {
      console.error("Failed to load accessibility settings from localStorage", error);
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("a11y-settings", JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save accessibility settings to localStorage", error);
    }

    const html = document.documentElement;
    html.classList.remove(
      "a11y-text-lg",
      "a11y-text-xl",
      "a11y-high-contrast",
      "a11y-grayscale",
      "a11y-links-underline",
      "a11y-readable-spacing",
      "a11y-dyslexia",
    );

    if (settings.textSize === 1) html.classList.add("a11y-text-lg");
    if (settings.textSize === 2) html.classList.add("a11y-text-xl");
    if (settings.highContrast) html.classList.add("a11y-high-contrast");
    if (settings.grayscale) html.classList.add("a11y-grayscale");
    if (settings.underlineLinks) html.classList.add("a11y-links-underline");
    if (settings.readableSpacing) html.classList.add("a11y-readable-spacing");
  }, [settings]);

  const toggleTextSize = () => {
    setSettings(prev => {
      const textSize: AccessibilitySettings["textSize"] =
        prev.textSize === 0 ? 1 : prev.textSize === 1 ? 2 : 0;
      return { ...prev, textSize };
    });
  };

  const toggleSetting = (key: Exclude<keyof AccessibilitySettings, "textSize">) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <div className="fixed bottom-2 right-2 z-50 sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          id="accessibility-panel"
          aria-label="Preferencias de accesibilidad"
          className="absolute bottom-16 right-0 mb-2 max-h-[min(75vh,32rem)] w-[min(18rem,calc(100vw-1rem))] overflow-y-auto rounded-2xl border border-white/10 bg-background p-4 text-foreground shadow-2xl"
        >
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="flex items-center gap-2 font-semibold">
              <Accessibility aria-hidden="true" className="h-5 w-5 text-primary-light" />
              Accesibilidad
            </h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
              aria-label="Cerrar menú de accesibilidad"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-2">
            <Button
              variant={settings.textSize > 0 ? "default" : "outline"}
              className="h-11 w-full justify-start whitespace-normal text-left text-sm"
              onClick={toggleTextSize}
              aria-pressed={settings.textSize > 0}
            >
              <Type aria-hidden="true" className="mr-2 h-4 w-4 shrink-0" />
              Tamaño de texto {settings.textSize === 1 ? "(Grande)" : settings.textSize === 2 ? "(Muy Grande)" : ""}
            </Button>
            
            <Button
              variant={settings.highContrast ? "default" : "outline"}
              className="h-11 w-full justify-start whitespace-normal text-left text-sm"
              onClick={() => toggleSetting("highContrast")}
              aria-pressed={settings.highContrast}
            >
              <Contrast aria-hidden="true" className="mr-2 h-4 w-4 shrink-0" />
              Alto contraste
            </Button>
            
            <Button
              variant={settings.grayscale ? "default" : "outline"}
              className="h-11 w-full justify-start whitespace-normal text-left text-sm"
              onClick={() => toggleSetting("grayscale")}
              aria-pressed={settings.grayscale}
            >
              <Palette aria-hidden="true" className="mr-2 h-4 w-4 shrink-0" />
              Escala de grises
            </Button>
            
            <Button
              variant={settings.underlineLinks ? "default" : "outline"}
              className="h-11 w-full justify-start whitespace-normal text-left text-sm"
              onClick={() => toggleSetting("underlineLinks")}
              aria-pressed={settings.underlineLinks}
            >
              <LinkIcon aria-hidden="true" className="mr-2 h-4 w-4 shrink-0" />
              Subrayar enlaces
            </Button>

            <Button
              variant={settings.readableSpacing ? "default" : "outline"}
              className="h-11 w-full justify-start whitespace-normal text-left text-sm"
              onClick={() => toggleSetting("readableSpacing")}
              aria-pressed={settings.readableSpacing}
            >
              <Type aria-hidden="true" className="mr-2 h-4 w-4 shrink-0" />
              Espaciado de lectura
            </Button>
          </div>
          
          <div className="mt-4 pt-3 border-t border-white/10">
            <Button
              variant="ghost"
              className="h-11 w-full whitespace-normal text-foreground"
              onClick={resetSettings}
            >
              <RotateCcw aria-hidden="true" className="mr-2 h-4 w-4 shrink-0" />
              Restablecer
            </Button>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full shadow-lg shadow-primary/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background sm:h-14 sm:w-14",
          isOpen ? "bg-white/10 text-white border border-white/20" : "bg-primary hover:bg-primary-light text-white"
        )}
        aria-label="Abrir menú de accesibilidad"
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
      >
        <Accessibility aria-hidden="true" className="h-6 w-6" />
      </button>
    </div>
  );
}
