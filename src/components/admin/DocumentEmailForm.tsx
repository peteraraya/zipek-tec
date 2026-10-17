"use client";

import { useActionState } from "react";
import {
  sendServiceDocumentEmailAction,
  type DocumentEmailState,
} from "@/app/actions/documents";
import { adminButtonClass, AdminField, AdminInput } from "@/components/admin/AdminField";
import { createZodFormValidator, LiveValidation } from "@/components/admin/LiveValidation";
import { documentEmailSchema } from "@/lib/admin/validation";

export default function DocumentEmailForm({
  documentId,
  defaultEmail,
}: {
  documentId: string;
  defaultEmail: string;
}) {
  const [state, action, pending] = useActionState<DocumentEmailState, FormData>(
    sendServiceDocumentEmailAction,
    {},
  );

  return (
    <LiveValidation action={action} className="space-y-4" validator={createZodFormValidator(documentEmailSchema)}>
      <input type="hidden" name="document_id" value={documentId} />
      <AdminField label="Enviar este documento al correo">
        <AdminInput type="email" name="recipient" required maxLength={254} defaultValue={defaultEmail} />
      </AdminField>
      {state.error && <p role="alert" className="text-sm text-red-300">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-emerald-300">{state.success}</p>}
      <p className="text-xs leading-5 text-gray-500">
        Se enviará un PDF adjunto y una versión legible en el cuerpo del correo.
      </p>
      <button type="submit" className={adminButtonClass} disabled={pending}>
        {pending ? "Enviando..." : "Enviar por correo"}
      </button>
    </LiveValidation>
  );
}
