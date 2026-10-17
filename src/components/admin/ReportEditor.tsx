"use client";

import { updateServiceReportAction } from "@/app/actions/admin";
import { AdminField, AdminInput, AdminSelect, AdminTextarea, adminButtonClass } from "@/components/admin/AdminField";
import { createZodFormValidator, LiveValidation } from "@/components/admin/LiveValidation";
import type { ServiceOrderRecord } from "@/lib/admin/types";
import { reportSchema } from "@/lib/admin/validation";

const validateReport = createZodFormValidator(reportSchema);

function isValidSoftwareProgram(item: unknown) {
  if (typeof item !== "object" || item === null || Array.isArray(item)) return false;
  if (!("name" in item) || !("license_type" in item) || !("notes" in item)) return false;
  return typeof item.name === "string"
    && typeof item.license_type === "string"
    && typeof item.notes === "string"
    && item.name.length <= 120
    && item.license_type.length <= 80
    && item.notes.length <= 500;
}

function validateReportForm(values: Record<string, FormDataEntryValue>) {
  const errors = validateReport(values);
  const rawSoftware = values.software_installed;
  const text = typeof rawSoftware === "string" ? rawSoftware : "";

  if (!text.trim()) {
    errors.software_installed = "Ingresa un JSON válido, por ejemplo [] si no hay programas.";
    return errors;
  }

  try {
    const programs: unknown = JSON.parse(text || "[]");
    if (!Array.isArray(programs) || programs.length > 50) {
      errors.software_installed = "La lista debe ser un arreglo con un máximo de 50 programas.";
    } else if (programs.some((item) => !isValidSoftwareProgram(item))) {
      errors.software_installed = "Cada programa debe incluir nombre, tipo de licencia y observación dentro del largo permitido.";
    }
  } catch {
    errors.software_installed = "Ingresa un JSON válido, por ejemplo [] si no hay programas.";
  }

  return errors;
}

export default function ReportEditor({ order }: { order: ServiceOrderRecord }) {
  return (
    <LiveValidation action={updateServiceReportAction} className="space-y-4" validator={validateReportForm}>
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
    </LiveValidation>
  );
}
