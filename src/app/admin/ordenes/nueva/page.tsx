import Link from "next/link";
import OrderCreateForm from "@/components/admin/OrderCreateForm";
import { getClients } from "@/lib/admin/queries";
import { requireStaff } from "@/lib/admin/auth";

export default async function NewServiceOrderPage() {
  await requireStaff("orders.manage");
  const clients = await getClients();

  return (
    <section className="mx-auto max-w-4xl">
      <Link href="/admin/ordenes" className="text-sm text-gray-400 hover:text-white">← Órdenes</Link>
      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">Anexo A · Orden de servicio</p>
      <h1 className="mt-2 text-3xl font-bold text-white">Nueva orden</h1>
      <p className="mt-2 text-gray-400">Registra el alcance autorizado y genera un enlace privado de seguimiento para compartir al cliente.</p>
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <OrderCreateForm clients={clients} />
      </div>
    </section>
  );
}
