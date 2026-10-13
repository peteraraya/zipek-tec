"use client";

import { useState, useEffect } from "react";
import { Accessibility, Type, Contrast, Palette, Link as LinkIcon, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    textSize: 0, // 0: default, 1: lg, 2: xl
    highContrast: false,
    grayscale: false,
    underlineLinks: false,
    dyslexia: false,
  });

  // Load settings from localStorage
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const savedSettings = localStorage.getItem("a11y-settings");
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (e) {
        console.error("Failed to load accessibility settings from localStorage", e);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  // Save settings to localStorage and apply classes to HTML element
  useEffect(() => {
    try {
      localStorage.setItem("a11y-settings", JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save accessibility settings to localStorage", e);
    }

    const html = document.documentElement;
    
    // Clear previous classes
    html.classList.remove("a11y-text-lg", "a11y-text-xl", "a11y-high-contrast", "a11y-grayscale", "a11y-links-underline", "a11y-dyslexia");
    
    // Apply new classes based on state
    if (settings.textSize === 1) html.classList.add("a11y-text-lg");
    if (settings.textSize === 2) html.classList.add("a11y-text-xl");
    if (settings.highContrast) html.classList.add("a11y-high-contrast");
    if (settings.grayscale) html.classList.add("a11y-grayscale");
    if (settings.underlineLinks) html.classList.add("a11y-links-underline");
    if (settings.dyslexia) html.classList.add("a11y-dyslexia");
    
  }, [settings]);

  const toggleTextSize = () => {
    setSettings(prev => ({ ...prev, textSize: (prev.textSize + 1) % 3 }));
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetSettings = () => {
    setSettings({
      textSize: 0,
      highContrast: false,
      grayscale: false,
      underlineLinks: false,
      dyslexia: false,
    });
  };

  return (
    <div className="fixed bottom-2 right-2 z-50 sm:bottom-6 sm:right-6">
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 w-72 rounded-2xl border border-white/10 bg-background/95 backdrop-blur-xl p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Accessibility className="w-5 h-5 text-primary-light" />
              Accesibilidad
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Cerrar menú de accesibilidad"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-2">
            <Button 
              variant={settings.textSize > 0 ? "default" : "outline"}
              className="w-full justify-start text-sm"
              onClick={toggleTextSize}
            >
              <Type className="w-4 h-4 mr-2" />
              Tamaño de texto {settings.textSize === 1 ? "(Grande)" : settings.textSize === 2 ? "(Muy Grande)" : ""}
            </Button>
            
            <Button 
              variant={settings.highContrast ? "default" : "outline"}
              className="w-full justify-start text-sm"
              onClick={() => toggleSetting("highContrast")}
            >
              <Contrast className="w-4 h-4 mr-2" />
              Alto contraste
            </Button>
            
            <Button 
              variant={settings.grayscale ? "default" : "outline"}
              className="w-full justify-start text-sm"
              onClick={() => toggleSetting("grayscale")}
            >
              <Palette className="w-4 h-4 mr-2" />
              Escala de grises
            </Button>
            
            <Button 
              variant={settings.underlineLinks ? "default" : "outline"}
              className="w-full justify-start text-sm"
              onClick={() => toggleSetting("underlineLinks")}
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Subrayar enlaces
            </Button>

            <Button 
              variant={settings.dyslexia ? "default" : "outline"}
              className="w-full justify-start text-sm"
              onClick={() => toggleSetting("dyslexia")}
            >
              <Type className="w-4 h-4 mr-2" />
              Fuente para dislexia
            </Button>
          </div>
          
          <div className="mt-4 pt-3 border-t border-white/10">
            <Button 
              variant="ghost" 
              className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={resetSettings}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restablecer
            </Button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full shadow-lg shadow-primary/20 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background sm:h-14 sm:w-14",
          isOpen ? "bg-white/10 text-white border border-white/20" : "bg-primary hover:bg-primary-light text-white"
        )}
        aria-label="Abrir menú de accesibilidad"
        aria-expanded={isOpen}
      >
        <Accessibility className="w-6 h-6" />
      </button>
    </div>
  );
}
