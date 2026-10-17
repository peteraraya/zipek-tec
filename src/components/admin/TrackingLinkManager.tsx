"use client";

import { useActionState, useState } from "react";
import {
  rotateOrderTrackingLinkAction,
  type TrackingLinkState,
} from "@/app/actions/admin";

export default function TrackingLinkManager({
  orderId,
  orderNumber,
}: {
  orderId: string;
  orderNumber: string;
}) {
  const [state, action, pending] = useActionState<TrackingLinkState, FormData>(
    rotateOrderTrackingLinkAction,
    {},
  );
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  async function copyLink() {
    if (!state.trackingUrl) return;
    try {
      await navigator.clipboard.writeText(state.trackingUrl);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopied(false);
      setCopyError("No se pudo copiar automáticamente. Selecciona y copia el enlace.");
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Enlace privado de seguimiento</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            Genera un enlace nuevo para copiarlo o enviarlo al cliente. Cada enlace nuevo reemplaza al anterior y lo invalida.
          </p>
        </div>
        <form action={action}>
          <input type="hidden" name="order_id" value={orderId} />
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
            disabled={pending}
          >
            {pending ? "Generando..." : state.trackingUrl ? "Generar otro enlace" : "Generar enlace"}
          </button>
        </form>
      </div>

      {state.error && <p role="alert" className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{state.error}</p>}
      {state.trackingUrl && (
        <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
          <p className="text-sm font-semibold text-emerald-200">
            Enlace nuevo para la orden {state.orderNumber ?? orderNumber}
          </p>
          <label htmlFor={`tracking-link-${orderId}`} className="mt-3 block text-xs text-gray-400">
            Cópialo y compártelo solo con el cliente autorizado.
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id={`tracking-link-${orderId}`}
              readOnly
              value={state.trackingUrl}
              onFocus={(event) => event.currentTarget.select()}
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-sm text-gray-100"
            />
            <button
              type="button"
              onClick={copyLink}
              className="rounded-lg border border-white/10 px-4 py-3 text-sm font-semibold text-gray-100 hover:bg-white/5"
            >
              {copied ? "Copiado" : "Copiar enlace"}
            </button>
          </div>
          {copyError && <p role="alert" className="mt-2 text-sm text-amber-200">{copyError}</p>}
          <p className="mt-3 text-xs leading-5 text-amber-100/80">
            El enlace anterior deja de funcionar al generar este. Si se creó por error, genera otro y comparte únicamente el más reciente.
          </p>
        </div>
      )}
    </section>
  );
}
