"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyPostButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function copyContent() {
    setError("");
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("No se pudo copiar. Selecciona el texto de la publicación para copiarlo manualmente.");
    }
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => void copyContent()}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-primary-light/25 px-3 py-2 text-sm font-semibold text-primary-light transition hover:border-primary-light/50 hover:bg-primary-light/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light"
      >
        {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        {copied ? "Texto copiado" : "Copiar publicación"}
      </button>
      <p aria-live="polite" className="mt-2 min-h-5 text-xs text-gray-500">
        {error}
      </p>
    </div>
  );
}
