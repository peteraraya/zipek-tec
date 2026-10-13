import type { Metadata } from "next";
import InquiryForm from "@/components/inquiries/InquiryForm";

export const metadata: Metadata = {
  title: "Enviar una consulta",
  description: "Envía una consulta a ZIPEK Tecnología y recibe un código de referencia.",
  robots: { index: false, follow: false },
};

export default async function PublicInquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ tema?: string }>;
}) {
  const { tema } = await searchParams;
  const initialTopic = tema?.trim().slice(0, 100) ?? "";

  return (
    <main className="px-4 pb-20 pt-12 sm:pt-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-light">Atención ZIPEK</p>
        <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">Enviar una consulta</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-400">
          Cuéntanos qué necesitas. Puedes dejar una consulta anónima o indicar un teléfono o correo y autorizarnos a responderte.
        </p>
      </div>
      <div className="mx-auto mt-10 max-w-2xl">
        <InquiryForm initialTopic={initialTopic} />
      </div>
    </main>
  );
}
