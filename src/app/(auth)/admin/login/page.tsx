import Link from "next/link";
import { Suspense } from "react";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { siteConfig } from "@/config/site";

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20">
        <Link href="/" className="text-sm text-gray-400 hover:text-white">← Volver al sitio</Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-primary-light">{siteConfig.name}</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Acceso administrativo</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-400">
          El ingreso está limitado al personal autorizado. No existe registro público de cuentas.
        </p>
        <AdminLoginForm unauthorized={params.error === "unauthorized"} />
      </section>
    </main>
  );
}

export default function AdminLoginPage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}>
      <LoginContent {...props} />
    </Suspense>
  );
}
