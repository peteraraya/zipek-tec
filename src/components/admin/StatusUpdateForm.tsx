import { updateOrderStatusAction } from "@/app/actions/admin";
import { AdminField, AdminInput, AdminSelect, adminButtonClass } from "@/components/admin/AdminField";
import { createZodFormValidator, LiveValidation } from "@/components/admin/LiveValidation";
import { serviceStatusLabels, type ServiceOrderRecord, type ServiceStatus } from "@/lib/admin/types";
import { statusUpdateSchema } from "@/lib/admin/validation";

const statuses = Object.entries(serviceStatusLabels) as Array<[ServiceStatus, string]>;

export default function StatusUpdateForm({ order }: { order: ServiceOrderRecord }) {
  return (
    <LiveValidation action={updateOrderStatusAction} className="flex flex-col gap-4 md:flex-row md:items-end" validator={createZodFormValidator(statusUpdateSchema)}>
      <input type="hidden" name="order_id" value={order.id} />
      <div className="md:w-64">
        <AdminField label="Cambiar estado">
          <AdminSelect name="status" defaultValue="" required>
            <option value="" disabled className="text-black">Selecciona un estado</option>
            {statuses.map(([value, label]) => <option key={value} value={value} className="text-black">{label}</option>)}
          </AdminSelect>
        </AdminField>
      </div>
      <div className="flex-1">
        <AdminField label="Mensaje visible al cliente (opcional)">
          <AdminInput name="public_message" defaultValue={order.public_message ?? ""} maxLength={500} />
        </AdminField>
      </div>
      <button className={adminButtonClass} type="submit">Actualizar</button>
    </LiveValidation>
  );
}
