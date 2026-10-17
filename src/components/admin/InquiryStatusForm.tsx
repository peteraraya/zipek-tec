import { updateInquiryStatusAction } from "@/app/actions/admin";
import { AdminField, AdminSelect, adminButtonClass } from "@/components/admin/AdminField";
import { createZodFormValidator, LiveValidation } from "@/components/admin/LiveValidation";
import { inquiryStatusSchema } from "@/lib/admin/validation";
import {
  serviceInquiryStatusLabels,
  type ServiceInquiryRecord,
  type ServiceInquiryStatus,
} from "@/lib/admin/types";

const statuses = Object.entries(serviceInquiryStatusLabels) as Array<[ServiceInquiryStatus, string]>;

export default function InquiryStatusForm({ inquiry }: { inquiry: ServiceInquiryRecord }) {
  return (
    <LiveValidation action={updateInquiryStatusAction} className="flex flex-col gap-4 sm:flex-row sm:items-end" validator={createZodFormValidator(inquiryStatusSchema)}>
      <input type="hidden" name="inquiry_id" value={inquiry.id} />
      <div className="flex-1">
        <AdminField label="Estado de atención">
          <AdminSelect name="status" defaultValue={inquiry.status}>
            {statuses.map(([value, label]) => <option key={value} value={value} className="text-black">{label}</option>)}
          </AdminSelect>
        </AdminField>
      </div>
      <button className={adminButtonClass} type="submit">Actualizar estado</button>
    </LiveValidation>
  );
}
