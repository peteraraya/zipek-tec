import type { Metadata } from "next";
import ProposalApproval from "@/components/proposals/ProposalApproval";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Revisión de propuesta",
  description: `Revisa y responde una propuesta de servicio de ${siteConfig.name}.`,
  robots: { index: false, follow: false },
};

export default function ProposalApprovalPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">Enlace privado de propuesta</p>
        <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Revisa el alcance antes de decidir.</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-400">
          Este enlace es privado. Verifica las tareas, exclusiones, costos y vigencia; al aceptar, solo autorizas lo que se describe aquí.
        </p>
      </header>
      <ProposalApproval />
    </main>
  );
}
