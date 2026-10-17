import { AdminRecordNotFoundError, getServiceDocument } from "@/lib/admin/queries";
import { createServiceDocumentPdf } from "@/lib/admin/document-pdf";
import { getDocumentTemplate } from "@/lib/admin/document-templates";
import { requireStaff } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireStaff();
  const { id } = await params;

  let record;
  try {
    record = await getServiceDocument(id);
  } catch (error) {
    if (error instanceof AdminRecordNotFoundError) {
      return Response.json({ error: "Documento no encontrado." }, { status: 404 });
    }
    throw error;
  }

  const template = getDocumentTemplate(record.document.template_id);
  if (!template) return Response.json({ error: "Tipo de documento no válido." }, { status: 404 });

  let orderNumber: string | undefined;
  if (record.document.order_id) {
    const { supabase } = await requireStaff();
    const { data: order, error } = await supabase
      .from("service_orders")
      .select("order_number")
      .eq("id", record.document.order_id)
      .maybeSingle();
    if (error) throw new Error(`No se pudo cargar la orden asociada: ${error.message}`);
    orderNumber = order?.order_number;
  }

  const pdf = await createServiceDocumentPdf(record.document, record.client.full_name, orderNumber);
  const filename = `zipek-${template.id}-${id.slice(0, 8)}.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
