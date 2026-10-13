import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import TrackingLookup from "@/components/tracking/TrackingLookup";

export const metadata: Metadata = {
  title: "Seguimiento de servicio",
  description: "Consulta el estado actualizado de tu servicio técnico ZIPEK.",
  robots: { index: false, follow: false },
};

export default function TrackingPage() {
  const phone = siteConfig.contact.phone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent("Hola, tengo una consulta sobre un servicio de ZIPEK.")}`;

  return (
    <main className="px-4 pb-20 pt-12 sm:pt-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-light">Atención transparente</p>
        <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">Seguimiento de servicio</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-400">
          Revisa el estado de tu equipo y las actualizaciones que ZIPEK comparte contigo.
        </p>
      </div>
      <div className="mt-10"><TrackingLookup /></div>
      <section className="mx-auto mt-10 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center sm:p-8">
        <h2 className="text-lg font-semibold text-white">¿Tienes una consulta?</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">
          Envíala por el formulario web para que quede registrada, o escríbenos por WhatsApp.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/consultas" className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-light">
            Enviar consulta web
          </Link>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/10 px-5 py-3 text-sm font-semibold text-gray-200 hover:bg-white/5">
            Consultar por WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
