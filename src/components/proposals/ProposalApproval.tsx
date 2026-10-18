"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { CheckCircle2, CircleX, FileCheck2, LoaderCircle } from "lucide-react";
import { z } from "zod";

const proposalSchema = z.object({
  proposal_number: z.string().nullable(),
  date: z.string().nullable(),
  expires_on: z.string(),
  client_name: z.string().nullable(),
  equipment: z.string().nullable(),
  modality: z.string().nullable(),
  situation: z.string().nullable(),
  tasks: z.string().nullable(),
  exclusions: z.string().nullable(),
  labor: z.string().nullable(),
  parts_licenses: z.string().nullable(),
  travel: z.string().nullable(),
  total: z.string().nullable(),
  tax_treatment: z.string().nullable(),
  delivery_date: z.string().nullable(),
  payment_terms: z.string().nullable(),
  warranty: z.string().nullable(),
  approval_status: z.enum(["pending", "accepted", "declined", "expired"]),
  signer_name: z.string().nullable(),
  responded_at: z.string().nullable(),
});

type Proposal = z.infer<typeof proposalSchema>;

const tokenPattern = /^[A-Za-z0-9_-]{43}$/;

function subscribeToHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getTokenFromHash() {
  return window.location.hash.slice(1);
}

function getServerToken() {
  return "";
}

function money(value: string | null) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return "No indicado";
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(amount);
}

async function loadProposal(token: string, signal?: AbortSignal) {
  const response = await fetch("/api/proposals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, action: "lookup" }),
    cache: "no-store",
    signal,
  });
  const payload: unknown = await response.json();
  if (!response.ok) {
    const error = z.object({ error: z.string().optional() }).safeParse(payload);
    throw new Error(error.success && error.data.error ? error.data.error : "No se pudo abrir la propuesta.");
  }
  const parsed = z.object({ proposal: proposalSchema }).safeParse(payload);
  if (!parsed.success) throw new Error("La propuesta recibida no es válida.");
  return parsed.data.proposal;
}

export default function ProposalApproval() {
  const token = useSyncExternalStore(subscribeToHash, getTokenFromHash, getServerToken);
  const [loadedProposal, setLoadedProposal] = useState<{ token: string; proposal: Proposal } | null>(null);
  const [signerName, setSignerName] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const [requestError, setRequestError] = useState<{ token: string; message: string } | null>(null);
  const [responseError, setResponseError] = useState<{ token: string; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const proposal = loadedProposal?.token === token ? loadedProposal.proposal : null;
  const error = responseError?.token === token
    ? responseError.message
    : requestError?.token === token ? requestError.message : "";
  const loading = Boolean(token && tokenPattern.test(token) && !proposal && requestError?.token !== token);

  useEffect(() => {
    if (!token || !tokenPattern.test(token)) return;

    const controller = new AbortController();
    void loadProposal(token, controller.signal)
      .then((loaded) => setLoadedProposal({ token, proposal: loaded }))
      .catch((loadError: unknown) => {
        if (loadError instanceof Error && loadError.name === "AbortError") return;
        setRequestError({
          token,
          message: loadError instanceof Error ? loadError.message : "No se pudo cargar la propuesta.",
        });
      });
    return () => controller.abort();
  }, [token]);

  async function respond(decision: "accepted" | "declined") {
    setResponseError(null);
    if (!confirmation) {
      setResponseError({ token, message: "Confirma que revisaste el alcance y las condiciones antes de responder." });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: "respond", decision, signer_name: signerName }),
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) {
        const parsedError = z.object({ error: z.string().optional() }).safeParse(payload);
        setResponseError({
          token,
          message: parsedError.success && parsedError.data.error
            ? parsedError.data.error
            : "No se pudo registrar tu respuesta.",
        });
        if (payload.status === "expired" || payload.status === "already_responded") {
          const refreshed = await loadProposal(token);
          setLoadedProposal({ token, proposal: refreshed });
        }
        return;
      }

      const refreshed = await loadProposal(token);
      setLoadedProposal({ token, proposal: refreshed });
    } catch (submitError) {
      setResponseError({
        token,
        message: submitError instanceof Error ? submitError.message : "No se pudo enviar la respuesta.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p role="status" className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-400"><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Cargando propuesta...</p>;
  }

  if (!token) {
    return <p className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-gray-300">Abre el enlace seguro de aprobación incluido en el correo de tu propuesta.</p>;
  }

  if (!tokenPattern.test(token)) {
    return <p role="alert" className="mt-8 rounded-xl border border-red-300/20 bg-red-300/[0.06] p-5 text-sm text-red-100">El enlace de aprobación no es válido.</p>;
  }

  if (!proposal) {
    return <p role="alert" className="mt-8 rounded-xl border border-red-300/20 bg-red-300/[0.06] p-5 text-sm text-red-100">{error || "No se pudo abrir esta propuesta."}</p>;
  }

  const decisionLabel = {
    pending: "Pendiente de respuesta",
    accepted: "Aceptada",
    declined: "Rechazada",
    expired: "Propuesta vencida",
  }[proposal.approval_status];
  const costs = [
    ["Mano de obra", proposal.labor],
    ["Repuestos y licencias", proposal.parts_licenses],
    ["Traslado", proposal.travel],
  ] as const;

  return (
    <div className="mt-8">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-light">Propuesta de servicio</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{proposal.proposal_number || "Propuesta"}</h2>
            <p className="mt-2 text-sm text-gray-400">Para {proposal.client_name || "cliente"} · válida hasta {new Date(`${proposal.expires_on}T12:00:00`).toLocaleDateString("es-CL")}</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-200">{decisionLabel}</span>
        </div>

        <dl className="mt-6 grid gap-5 sm:grid-cols-2">
          {[
            ["Equipo o sistema", proposal.equipment],
            ["Modalidad", proposal.modality],
            ["Situación evaluada", proposal.situation],
            ["Tareas incluidas", proposal.tasks],
            ["Exclusiones", proposal.exclusions],
            ["Fecha estimada de entrega", proposal.delivery_date],
            ["Forma de pago", proposal.payment_terms],
            ["Garantía aplicable", proposal.warranty],
            ["Tratamiento de IVA / impuestos", proposal.tax_treatment],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-white/[0.08] p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
              <dd className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-200">{value?.trim() || "No indicado"}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-6 rounded-xl border border-white/10 p-4 sm:p-5">
          <h3 className="font-semibold text-white">Desglose de costos</h3>
          <dl className="mt-4 space-y-3 text-sm">
            {costs.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 text-gray-300">
                <dt>{label}</dt><dd className="font-medium text-white">{money(value)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-t border-white/10 pt-3 text-base font-bold text-white">
              <dt>Total</dt><dd>{money(proposal.total)}</dd>
            </div>
          </dl>
        </section>
        <p className="mt-4 rounded-lg bg-white/[0.04] p-4 text-xs leading-5 text-gray-400">
          {proposal.approval_status === "pending"
            ? "Al aceptar autorizas únicamente estas tareas y este total. Todo cambio o adicional requiere una nueva cotización y tu aprobación. La aceptación digital deja constancia de la decisión, el nombre indicado y la hora registrada."
            : proposal.approval_status === "accepted"
              ? `Respuesta registrada como aceptada por ${proposal.signer_name || "el cliente"}${proposal.responded_at ? ` el ${new Date(proposal.responded_at).toLocaleString("es-CL")}` : ""}.`
              : proposal.approval_status === "declined"
                ? `Respuesta registrada como rechazada por ${proposal.signer_name || "el cliente"}${proposal.responded_at ? ` el ${new Date(proposal.responded_at).toLocaleString("es-CL")}` : ""}.`
                : "El plazo para responder venció. Contacta a Zipek si necesitas solicitar una propuesta actualizada."}
        </p>
      </section>

      {proposal.approval_status === "pending" && (
        <section className="mt-5 rounded-2xl border border-primary-light/20 bg-primary-light/[0.035] p-5 sm:p-7">
          <h2 className="text-lg font-semibold text-white">Registrar tu decisión</h2>
          {error && <p role="alert" className="mt-4 rounded-lg bg-red-300/[0.06] p-3 text-sm text-red-100">{error}</p>}
          <label className="mt-4 block text-sm font-medium text-gray-200">
            Tu nombre completo
            <input value={signerName} onChange={(event) => setSignerName(event.target.value)} required minLength={2} maxLength={160} autoComplete="name" className="mt-2 min-h-11 w-full rounded-lg border border-white/10 bg-background px-3 text-sm text-white sm:max-w-md" />
          </label>
          <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm leading-6 text-gray-300">
            <input type="checkbox" checked={confirmation} onChange={(event) => setConfirmation(event.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
            <span>Confirmo que revisé el alcance, exclusiones, costos, forma de pago y garantía indicados en esta propuesta.</span>
          </label>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" disabled={submitting || signerName.trim().length < 2 || !confirmation} onClick={() => void respond("accepted")} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {submitting ? "Registrando..." : "Aceptar propuesta"}
            </button>
            <button type="button" disabled={submitting || signerName.trim().length < 2 || !confirmation} onClick={() => void respond("declined")} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50">
              <CircleX className="h-4 w-4" aria-hidden="true" />
              Rechazar propuesta
            </button>
          </div>
        </section>
      )}
      {proposal.approval_status === "accepted" && (
        <p role="status" className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.05] p-4 text-sm text-emerald-100"><FileCheck2 className="h-5 w-5" aria-hidden="true" /> Tu aceptación quedó registrada. Zipek coordinará contigo antes de iniciar el servicio.</p>
      )}
      {proposal.approval_status === "declined" && (
        <p role="status" className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-300">Tu respuesta quedó registrada. Si deseas revisar una alternativa, comunícate con Zipek.</p>
      )}
    </div>
  );
}
