import { updateServiceReportAction } from "@/app/actions/admin";
import { AdminField, AdminInput, AdminSelect, AdminTextarea, adminButtonClass } from "@/components/admin/AdminField";
import type { ServiceOrderRecord } from "@/lib/admin/types";

export default function ReportEditor({ order }: { order: ServiceOrderRecord }) {
  return (
    <form action={updateServiceReportAction} className="space-y-4">
      <input type="hidden" name="order_id" value={order.id} />
      <AdminField label="Diagnóstico">
        <AdminTextarea name="diagnosis" rows={4} defaultValue={order.diagnosis ?? ""} maxLength={4000} />
      </AdminField>
      <div className="grid gap-4 md:grid-cols-2">
        <AdminField label="Estado del respaldo">
          <AdminSelect name="backup_status" defaultValue={order.backup_status}>
            <option value="pending" className="text-black">Pendiente</option>
            <option value="completed" className="text-black">Realizado</option>
            <option value="declined" className="text-black">Rechazado por el cliente</option>
            <option value="not_required" className="text-black">No requerido</option>
          </AdminSelect>
        </AdminField>
        <AdminField label="Detalle del respaldo">
          <AdminInput name="backup_details" defaultValue={order.backup_details ?? ""} maxLength={2000} />
        </AdminField>
      </div>
      <AdminField label="Software instalado (JSON)">
        <AdminTextarea
          name="software_installed"
          rows={5}
          defaultValue={JSON.stringify(order.software_installed ?? [], null, 2)}
          placeholder={'[{"name":"LibreOffice","license_type":"Libre","notes":"Instalado y actualizado"}]'}
          maxLength={10000}
          required
        />
      </AdminField>
      <AdminField label="Recomendaciones">
        <AdminTextarea name="recommendations" rows={4} defaultValue={order.recommendations ?? ""} maxLength={4000} />
      </AdminField>
      <button className={adminButtonClass} type="submit">Guardar y registrar en historial</button>
    </form>
  );
}
