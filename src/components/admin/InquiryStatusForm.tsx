import { updateInquiryStatusAction } from "@/app/actions/admin";
import { AdminField, AdminSelect, adminButtonClass } from "@/components/admin/AdminField";
import {
  serviceInquiryStatusLabels,
  type ServiceInquiryRecord,
  type ServiceInquiryStatus,
} from "@/lib/admin/types";

const statuses = Object.entries(serviceInquiryStatusLabels) as Array<[ServiceInquiryStatus, string]>;

export default function InquiryStatusForm({ inquiry }: { inquiry: ServiceInquiryRecord }) {
  return (
    <form action={updateInquiryStatusAction} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <input type="hidden" name="inquiry_id" value={inquiry.id} />
      <div className="flex-1">
        <AdminField label="Estado de atención">
          <AdminSelect name="status" defaultValue={inquiry.status}>
            {statuses.map(([value, label]) => <option key={value} value={value} className="text-black">{label}</option>)}
          </AdminSelect>
        </AdminField>
      </div>
      <button className={adminButtonClass} type="submit">Actualizar estado</button>
    </form>
  );
}
