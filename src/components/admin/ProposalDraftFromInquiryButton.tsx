"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createServiceProposalDraftFromInquiryAction,
  type ProposalDraftState,
} from "@/app/actions/documents";
import { adminButtonClass } from "@/components/admin/AdminField";

export default function ProposalDraftFromInquiryButton({ inquiryId }: { inquiryId: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ProposalDraftState, FormData>(
    createServiceProposalDraftFromInquiryAction,
    {},
  );

  useEffect(() => {
    if (state.documentId) router.push(`/admin/documentos/${state.documentId}`);
  }, [router, state.documentId]);

  return (
    <form action={action} className="mt-5">
      <input type="hidden" name="inquiry_id" value={inquiryId} />
      {state.error && <p role="alert" className="mb-3 text-sm text-red-300">{state.error}</p>}
      <button type="submit" className={adminButtonClass} disabled={pending}>
        {pending ? "Creando borrador..." : "Crear borrador de propuesta"}
      </button>
      <p className="mt-2 text-xs leading-5 text-gray-500">
        Se creará un cliente con los datos de contacto autorizados y un borrador sin precio ni vigencia predefinidos.
      </p>
    </form>
  );
}
