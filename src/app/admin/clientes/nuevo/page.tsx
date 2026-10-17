import Link from "next/link";
import { createClientAction } from "@/app/actions/admin";
import { AdminField, AdminInput, AdminTextarea, adminButtonClass } from "@/components/admin/AdminField";
import { ClientLiveValidation } from "@/components/admin/LiveValidation";
import { requireStaff } from "@/lib/admin/auth";

export default async function NewClientPage() {
  await requireStaff("clients.manage");
  return (
    <section className="mx-auto max-w-3xl">
      <Link href="/admin/clientes" className="text-sm text-gray-400 hover:text-white">← Clientes</Link>
      <h1 className="mt-5 text-3xl font-bold text-white">Registrar cliente</h1>
      <p className="mt-2 text-gray-400">Los datos de contacto solo son visibles para personal autorizado.</p>
      <ClientLiveValidation action={createClientAction} className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <AdminField label="Nombre o razón social"><AdminInput name="full_name" required minLength={2} maxLength={160} /></AdminField>
        <div className="grid gap-5 md:grid-cols-2">
          <AdminField label="RUT (opcional)"><AdminInput name="rut" maxLength={20} /></AdminField>
          <AdminField label="Teléfono"><AdminInput type="tel" name="phone" required minLength={6} maxLength={40} /></AdminField>
        </div>
        <AdminField label="Correo electrónico (opcional)"><AdminInput type="email" name="email" maxLength={254} /></AdminField>
        <AdminField label="Dirección (opcional)"><AdminInput name="address" maxLength={300} /></AdminField>
        <AdminField label="Notas internas (opcional)"><AdminTextarea name="notes" rows={4} maxLength={2000} /></AdminField>
        <button className={adminButtonClass} type="submit">Guardar cliente</button>
      </ClientLiveValidation>
    </section>
  );
}
