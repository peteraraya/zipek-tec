import Link from "next/link";
import { getClients } from "@/lib/admin/queries";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; updated?: string; error?: string }>;
}) {
  const [clients, params] = await Promise.all([getClients(), searchParams]);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">Directorio</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Clientes</h1>
          <p className="mt-2 text-gray-400">Información de contacto y acceso a las fichas de cada cliente.</p>
        </div>
        <Link href="/admin/clientes/nuevo" className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-light">Registrar cliente</Link>
      </div>

      {params.created && <p className="mt-5 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-200">Cliente registrado.</p>}
      {params.updated && <p className="mt-5 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-200">Datos del cliente actualizados.</p>}
      {params.error && <p role="alert" className="mt-5 rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{params.error}</p>}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-6 py-4 font-medium">Nombre</th>
              <th className="px-6 py-4 font-medium">Teléfono</th>
              <th className="px-6 py-4 font-medium">Correo</th>
              <th className="px-6 py-4 font-medium">RUT</th>
              <th className="px-6 py-4 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {clients.map((client) => (
              <tr key={client.id} className="text-gray-300">
                <td className="px-6 py-4 font-medium text-white">{client.full_name}</td>
                <td className="px-6 py-4">{client.phone}</td>
                <td className="px-6 py-4">{client.email || "—"}</td>
                <td className="px-6 py-4">{client.rut || "—"}</td>
                <td className="px-6 py-4"><Link href={`/admin/clientes/${client.id}`} className="text-primary-light hover:underline">Ver / editar</Link></td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No hay clientes activos registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
