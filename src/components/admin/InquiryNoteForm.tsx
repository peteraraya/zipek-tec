import { addInquiryNoteAction } from "@/app/actions/admin";
import { AdminField, AdminTextarea, adminButtonClass } from "@/components/admin/AdminField";

export default function InquiryNoteForm({ inquiryId }: { inquiryId: string }) {
  return (
    <form action={addInquiryNoteAction} className="space-y-4">
      <input type="hidden" name="inquiry_id" value={inquiryId} />
      <AdminField label="Nota interna (solo visible para el equipo)">
        <AdminTextarea name="note" required minLength={3} maxLength={3000} rows={3} />
      </AdminField>
      <button className={adminButtonClass} type="submit">Guardar nota</button>
    </form>
  );
}
