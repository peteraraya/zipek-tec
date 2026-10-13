"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createOrderAction, type OrderCreateState } from "@/app/actions/admin";
import { AdminField, AdminInput, AdminSelect, AdminTextarea, adminButtonClass } from "@/components/admin/AdminField";
import type { ClientRecord } from "@/lib/admin/types";

export default function OrderCreateForm({ clients }: { clients: ClientRecord[] }) {
  const [state, action, pending] = useActionState<OrderCreateState, FormData>(createOrderAction, {});

  if (state.trackingUrl && state.orderNumber) {
    return (
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6">
        <p className="text-sm font-semibold text-emerald-300">Orden {state.orderNumber} creada</p>
        <p className="mt-2 text-sm text-gray-300">
          Comparte este enlace de seguimiento al cliente. Solo se muestra ahora; guárdalo en la orden de servicio.
        </p>
        <Link className="mt-4 inline-block break-all text-sm text-primary-light underline" href={state.trackingUrl}>
          {state.trackingUrl}
        </Link>
        <div className="mt-6">
          <Link className="text-sm text-gray-300 underline" href="/admin/ordenes">
            Volver a las órdenes
          </Link>
        </div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-5 text-sm text-amber-100">
        Registra primero un cliente para crear su orden de servicio.
        <Link href="/admin/clientes" className="ml-2 underline">Ir a clientes</Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state.error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{state.error}</p>}
      <div className="grid gap-5 md:grid-cols-2">
        <AdminField label="Cliente">
          <AdminSelect name="client_id" required defaultValue="">
            <option value="" disabled>Selecciona un cliente</option>
            {clients.map((client) => <option key={client.id} value={client.id} className="text-black">{client.full_name} · {client.phone}</option>)}
          </AdminSelect>
        </AdminField>
        <AdminField label="Tipo de servicio">
          <AdminSelect name="service_type" required defaultValue="Puesta a Punto Legal">
            {["Hogar Seguro", "Puesta a Punto Legal", "Pyme Tranquila", "Atención urgente", "Otro"].map((option) => (
              <option key={option} value={option} className="text-black">{option}</option>
            ))}
          </AdminSelect>
        </AdminField>
      </div>
      <AdminField label="Descripción del servicio">
        <AdminTextarea name="service_description" rows={3} required maxLength={2000} />
      </AdminField>
      <AdminField label="Problema reportado">
        <AdminTextarea name="reported_problem" rows={3} required maxLength={2000} />
      </AdminField>
      <AdminField label="Trabajo autorizado">
        <AdminTextarea name="authorized_work" rows={3} required maxLength={2000} />
      </AdminField>
      <div className="grid gap-5 md:grid-cols-3">
        <AdminField label="Prioridad">
          <AdminSelect name="priority" defaultValue="standard">
            <option value="standard" className="text-black">Normal</option>
            <option value="urgent" className="text-black">Urgente</option>
          </AdminSelect>
        </AdminField>
        <AdminField label="Precio cerrado (CLP)">
          <AdminInput type="number" name="quoted_amount" min="0" step="1" inputMode="numeric" />
        </AdminField>
        <AdminField label="Garantía (días)">
          <AdminInput type="number" name="warranty_days" min="0" max="365" defaultValue="15" required />
        </AdminField>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <AdminField label="Marca del equipo">
          <AdminInput name="equipment_brand" maxLength={100} />
        </AdminField>
        <AdminField label="Modelo">
          <AdminInput name="equipment_model" maxLength={100} />
        </AdminField>
        <AdminField label="Número de serie">
          <AdminInput name="equipment_serial" maxLength={120} />
        </AdminField>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <AdminField label="Respaldo previo">
          <AdminSelect name="backup_status" defaultValue="pending">
            <option value="pending" className="text-black">Pendiente de definir</option>
            <option value="completed" className="text-black">Realizado</option>
            <option value="declined" className="text-black">Cliente lo rechazó</option>
            <option value="not_required" className="text-black">No requerido</option>
          </AdminSelect>
        </AdminField>
        <AdminField label="Forma de pago acordada">
          <AdminInput name="payment_method" maxLength={80} />
        </AdminField>
      </div>
      <AdminField label="Observaciones del estado inicial">
        <AdminTextarea name="initial_condition" rows={3} maxLength={2000} />
      </AdminField>
      <button type="submit" className={adminButtonClass} disabled={pending}>
        {pending ? "Guardando orden..." : "Crear orden y generar seguimiento"}
      </button>
    </form>
  );
}
