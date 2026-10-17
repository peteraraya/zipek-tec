import { logServiceTaskAction } from "@/app/actions/admin";
import { AdminField, AdminInput, AdminSelect, adminButtonClass } from "@/components/admin/AdminField";
import { createZodFormValidator, LiveValidation } from "@/components/admin/LiveValidation";
import { taskSchema } from "@/lib/admin/validation";

export default function TaskLogForm({ orderId }: { orderId: string }) {
  return (
    <LiveValidation action={logServiceTaskAction} className="flex flex-col gap-4 md:flex-row md:items-end" validator={createZodFormValidator(taskSchema)}>
      <input type="hidden" name="order_id" value={orderId} />
      <div className="flex-1">
        <AdminField label="Tarea realizada o pendiente">
          <AdminInput name="description" required minLength={3} maxLength={1000} />
        </AdminField>
      </div>
      <div className="md:w-52">
        <AdminField label="Estado de la tarea">
          <AdminSelect name="completed" defaultValue="true">
            <option value="true" className="text-black">Completada</option>
            <option value="false" className="text-black">Pendiente</option>
          </AdminSelect>
        </AdminField>
      </div>
      <button className={adminButtonClass} type="submit">Registrar tarea</button>
    </LiveValidation>
  );
}
