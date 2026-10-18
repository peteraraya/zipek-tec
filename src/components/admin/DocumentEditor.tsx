"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveServiceDocumentAction,
  type DocumentSaveState,
} from "@/app/actions/documents";
import type { DocumentTemplate } from "@/lib/admin/document-templates";
import type { ClientRecord, ServiceOrderRecord } from "@/lib/admin/types";
import { adminButtonClass, AdminField, AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/AdminField";
import { LiveValidation, type FormValidator } from "@/components/admin/LiveValidation";

function createDocumentValidator(template: DocumentTemplate, documentId?: string): FormValidator {
  return (values) => {
    const errors: Record<string, string> = {};
    if (!documentId && !values.client_id) errors.client_id = "Selecciona un cliente.";

    for (const field of template.fields) {
      const name = `data_${field.name}`;
      const value = values[name];
      const text = typeof value === "string" ? value.trim() : "";
      const maxLength = field.type === "textarea" ? 10000 : 500;
      if (field.required && !text) {
        errors[name] = "Completa este campo.";
      } else if (text.length > maxLength) {
        errors[name] = `No superes los ${maxLength} caracteres.`;
      } else if (field.type === "email" && text && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
        errors[name] = "Ingresa un correo válido.";
      } else if (field.type === "date" && text && !/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        errors[name] = "Ingresa una fecha válida.";
      }
    }

    return errors;
  };
}

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
  const [proposalCosts, setProposalCosts] = useState({
    mano_obra: initialData.mano_obra ?? "",
    repuestos_licencias: initialData.repuestos_licencias ?? "",
    traslado: initialData.traslado ?? "",
  });
  const calculatedTotal = Object.values(proposalCosts).reduce(
    (total, amount) => total + (amount && /^\d+$/.test(amount) ? Number(amount) : 0),
    0,
  );

  useEffect(() => {
    if (state.documentId) router.push(`/admin/documentos/${state.documentId}`);
  }, [router, state.documentId]);

  return (
    <LiveValidation action={action} className="space-y-6" validator={createDocumentValidator(template, documentId)}>
      <input type="hidden" name="template_id" value={template.id} />
      {documentId && <input type="hidden" name="document_id" value={documentId} />}
      {template.id === "service-proposal" && (
        <input type="hidden" name="data_total" value={String(calculatedTotal)} />
      )}
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
                    {template.id === "service-proposal" && ["mano_obra", "repuestos_licencias", "traslado"].includes(field.name) ? (
                      <AdminInput
                        type="number"
                        name={`data_${field.name}`}
                        min={0}
                        max={999999999}
                        step={1}
                        inputMode="numeric"
                        value={proposalCosts[field.name as keyof typeof proposalCosts]}
                        onChange={(event) => {
                          const value = event.target.value;
                          setProposalCosts((current) => ({ ...current, [field.name]: value }));
                        }}
                      />
                    ) : template.id === "service-proposal" && field.name === "total" ? (
                      <div>
                        <p className="mt-2 rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white">
                          {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(calculatedTotal)}
                        </p>
                        <span className="mt-1 block text-xs font-normal text-gray-500">Suma automática de los costos ingresados. Los campos vacíos se consideran $0.</span>
                      </div>
                    ) : field.type === "textarea" ? (
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
    </LiveValidation>
  );
}
