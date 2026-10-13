"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { serviceStatusLabels, type ServiceStatus } from "@/lib/admin/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface TrackingData {
  order_number: string;
  service_type: string;
  status: ServiceStatus;
  public_message: string | null;
  updated_at: string;
  events: Array<{ summary: string; created_at: string }>;
}

const tokenPattern = /^[A-Za-z0-9_-]{43}$/;

function subscribeToHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getHashToken() {
  return window.location.hash.slice(1);
}

function getServerHashToken() {
  return "";
}

export default function TrackingLookup() {
  const hashToken = useSyncExternalStore(subscribeToHash, getHashToken, getServerHashToken);
  const [editedToken, setEditedToken] = useState<string | null>(null);
  const [result, setResult] = useState<TrackingData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const token = editedToken ?? hashToken;
  const hasTrackingResult = result !== null;

  const loadTracking = useCallback(async (value: string, signal?: AbortSignal) => {
    if (!tokenPattern.test(value)) {
      setError("El enlace o código de seguimiento no es válido.");
      setResult(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: value }),
        cache: "no-store",
        signal,
      });
      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 404) setResult(null);
        setError(typeof payload.error === "string" ? payload.error : "No se pudo consultar el seguimiento.");
        return;
      }

      setResult(payload as TrackingData);
      setError("");
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.name === "AbortError") return;
      setError("No se pudo conectar para consultar el seguimiento.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!tokenPattern.test(hashToken)) return;
    const controller = new AbortController();
    void Promise.resolve().then(() => loadTracking(hashToken, controller.signal));
    return () => controller.abort();
  }, [hashToken, loadTracking]);

  useEffect(() => {
    if (!hasTrackingResult || !token) return;
    let active = true;
    const supabase = createSupabaseBrowserClient();
    const subscription = async () => {
      const digest = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
      const tokenHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
      if (!active) return;
      const channel = supabase
        .channel(`service-tracking:${tokenHash}`, { config: { private: true } })
        .on("broadcast", { event: "status_update" }, () => void loadTracking(token))
        .subscribe((status, error) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.warn("Seguimiento Realtime no disponible; se mantiene la consulta periódica.", error);
          }
        });
      return () => {
        active = false;
        void supabase.removeChannel(channel);
      };
    };
    let unsubscribe: (() => void) | undefined;
    void subscription().then((cleanup) => {
      if (active) unsubscribe = cleanup;
      else cleanup?.();
    }).catch(() => {
      active = false;
      console.warn("No fue posible inicializar el canal privado de seguimiento; se mantiene la consulta periódica.");
    });
    const interval = window.setInterval(() => void loadTracking(token), 15000);
    return () => {
      active = false;
      unsubscribe?.();
      window.clearInterval(interval);
    };
  }, [hasTrackingResult, loadTracking, token]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setResult(null);
    const normalizedToken = token.trim();
    if (tokenPattern.test(normalizedToken)) {
      window.history.replaceState(null, "", `/seguimiento#${normalizedToken}`);
      void loadTracking(normalizedToken);
    } else {
      setIsLoading(false);
      setError("Ingresa el código completo que recibiste de ZIPEK.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <label className="block text-sm font-medium text-gray-200" htmlFor="tracking-token">
          Código o enlace de seguimiento
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="tracking-token"
            value={token}
            onChange={(event) => setEditedToken(event.target.value)}
            placeholder="Pega aquí el enlace recibido por WhatsApp"
            autoComplete="off"
            className="min-h-12 min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-50" type="submit" disabled={isLoading}>
            {isLoading ? "Consultando..." : "Consultar"}
          </button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-gray-500">
          El enlace funciona como una clave privada: compártelo solo con personas autorizadas.
        </p>
      </form>

      {error && <p role="alert" className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</p>}

      {result && (
        <section aria-live="polite" className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-light">Estado del servicio</p>
              <h2 className="mt-2 text-2xl font-bold text-white">{serviceStatusLabels[result.status]}</h2>
              <p className="mt-2 text-sm text-gray-400">{result.order_number} · {result.service_type}</p>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">Actualización automática</span>
          </div>
          {result.public_message && <p className="mt-5 rounded-lg bg-white/5 p-4 text-sm text-gray-200">{result.public_message}</p>}
          <p className="mt-4 text-xs text-gray-500">Última actualización: {new Date(result.updated_at).toLocaleString("es-CL")}. Se consulta cada 15 segundos.</p>
          <ol className="mt-7 space-y-4 border-l border-white/10 pl-5">
            {result.events.map((event, index) => (
              <li key={`${event.created_at}-${index}`} className="relative">
                <span className="absolute -left-[1.55rem] top-1.5 h-2 w-2 rounded-full bg-primary-light" />
                <p className="text-sm text-gray-200">{event.summary}</p>
                <p className="mt-1 text-xs text-gray-500">{new Date(event.created_at).toLocaleString("es-CL")}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
