import Link from "next/link";
import { notFound } from "next/navigation";
import { archiveClientAction, updateClientAction } from "@/app/actions/admin";
import { AdminField, AdminInput, AdminTextarea, adminButtonClass } from "@/components/admin/AdminField";
import { ClientLiveValidation } from "@/components/admin/LiveValidation";
import { AdminRecordNotFoundError, getClient } from "@/lib/admin/queries";

export default async function EditClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  let client;
  try {
    client = await getClient(id);
  } catch (error) {
    if (error instanceof AdminRecordNotFoundError) notFound();
    throw error;
  }

  return (
    <section className="mx-auto max-w-3xl">
      <Link href="/admin/clientes" className="text-sm text-gray-400 hover:text-white">← Clientes</Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">Ficha de cliente</p>
          <h1 className="mt-2 text-3xl font-bold text-white">{client.full_name}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/admin/documentos?cliente=${client.id}`} className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-light">
            Generar documento
          </Link>
          {!client.archived_at && (
            <form action={archiveClientAction}>
              <input type="hidden" name="id" value={client.id} />
              <button className="rounded-lg border border-red-400/20 px-4 py-3 text-sm text-red-200 hover:bg-red-500/10" type="submit">Archivar cliente</button>
            </form>
          )}
        </div>
      </div>
      {query.error && <p role="alert" className="mt-5 rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{query.error}</p>}
      {client.archived_at && <p className="mt-5 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-100">Cliente archivado.</p>}
      <ClientLiveValidation action={updateClientAction} className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <input type="hidden" name="id" value={client.id} />
        <AdminField label="Nombre o razón social"><AdminInput name="full_name" defaultValue={client.full_name} required minLength={2} maxLength={160} /></AdminField>
        <div className="grid gap-5 md:grid-cols-2">
          <AdminField label="RUT (opcional)"><AdminInput name="rut" defaultValue={client.rut ?? ""} maxLength={20} /></AdminField>
          <AdminField label="Teléfono"><AdminInput type="tel" name="phone" defaultValue={client.phone} required minLength={6} maxLength={40} /></AdminField>
        </div>
        <AdminField label="Correo electrónico (opcional)"><AdminInput type="email" name="email" defaultValue={client.email ?? ""} maxLength={254} /></AdminField>
        <AdminField label="Dirección (opcional)"><AdminInput name="address" defaultValue={client.address ?? ""} maxLength={300} /></AdminField>
        <AdminField label="Notas internas"><AdminTextarea name="notes" rows={4} defaultValue={client.notes ?? ""} maxLength={2000} /></AdminField>
        <button className={adminButtonClass} type="submit">Guardar cambios</button>
      </ClientLiveValidation>
    </section>
  );
}
