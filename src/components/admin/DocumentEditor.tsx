"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  saveServiceDocumentAction,
  type DocumentSaveState,
} from "@/app/actions/documents";
import type { DocumentTemplate } from "@/lib/admin/document-templates";
import type { ClientRecord, ServiceOrderRecord } from "@/lib/admin/types";
import { adminButtonClass, AdminField, AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/AdminField";

export default function DocumentEditor({
  template,
  clients,
  orders,
  initialClientId,
  initialOrderId,
  initialData,
  documentId,
}: {
  template: DocumentTemplate;
  clients: ClientRecord[];
  orders: ServiceOrderRecord[];
  initialClientId: string;
  initialOrderId: string;
  initialData: Record<string, string>;
  documentId?: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<DocumentSaveState, FormData>(
    saveServiceDocumentAction,
    {},
  );
  const selectedClient = clients.find((client) => client.id === initialClientId);
  const selectedOrder = orders.find((order) => order.id === initialOrderId);

  useEffect(() => {
    if (state.documentId) router.push(`/admin/documentos/${state.documentId}`);
  }, [router, state.documentId]);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="template_id" value={template.id} />
      {documentId && <input type="hidden" name="document_id" value={documentId} />}
      {state.error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{state.error}</p>}

      {documentId ? (
        <div className="grid gap-5 rounded-xl border border-white/10 bg-white/[0.02] p-5 md:grid-cols-2">
          <input type="hidden" name="client_id" value={initialClientId} />
          <input type="hidden" name="order_id" value={initialOrderId} />
          <p className="text-sm text-gray-300">Cliente: <strong>{selectedClient?.full_name ?? "No disponible"}</strong></p>
          <p className="text-sm text-gray-300">Orden asociada: <strong>{selectedOrder?.order_number ?? "Ninguna"}</strong></p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          <AdminField label="Cliente">
            <AdminSelect name="client_id" defaultValue={initialClientId} required>
              <option value="" disabled>Selecciona un cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id} className="text-black">
                  {client.full_name} · {client.phone}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label="Orden asociada (opcional)">
            <AdminSelect name="order_id" defaultValue={initialOrderId}>
              <option value="" className="text-black">Sin orden asociada</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id} className="text-black">
                  {order.order_number}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
        </div>
      )}

      {template.sections.map((section, index) => {
        const sectionFields = (section.fields ?? [])
          .map((fieldName) => template.fields.find((field) => field.name === fieldName))
          .filter((field) => field !== undefined);

        return (
          <section key={`${section.title}-${index}`} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <h2 className="text-lg font-semibold text-white">{section.title}</h2>
            {section.paragraphs && (
              <div className="mt-3 space-y-2 text-sm leading-6 text-gray-400">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            )}
            {sectionFields.length > 0 && (
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {sectionFields.map((field) => (
                  <AdminField key={field.name} label={field.label}>
                    {field.hint && <span className="mt-1 block text-xs font-normal text-gray-500">{field.hint}</span>}
                    {field.requiredForSend && <span className="mt-1 block text-xs font-normal text-amber-200">Completa este campo antes de enviar.</span>}
                    {field.type === "textarea" ? (
                      <AdminTextarea
                        name={`data_${field.name}`}
                        rows={4}
                        maxLength={10000}
                        defaultValue={initialData[field.name] ?? ""}
                      />
                    ) : field.type === "checkbox" ? (
                      <span className="mt-3 flex items-start gap-3">
                        <input
                          type="checkbox"
                          name={`data_${field.name}`}
                          value="yes"
                          defaultChecked={initialData[field.name] === "Sí"}
                          className="mt-1 h-4 w-4 accent-primary"
                        />
                        <span className="text-sm font-normal text-gray-200">La persona lo acepta / recibió</span>
                      </span>
                    ) : (
                      <AdminInput
                        type={field.type ?? "text"}
                        name={`data_${field.name}`}
                        maxLength={500}
                        required={field.required}
                        defaultValue={initialData[field.name] ?? ""}
                      />
                    )}
                  </AdminField>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <button type="submit" className={adminButtonClass} disabled={pending}>
        {pending ? "Guardando documento..." : documentId ? "Guardar cambios" : "Guardar borrador"}
      </button>
    </form>
  );
}
