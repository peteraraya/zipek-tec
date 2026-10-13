import { createClient } from "@supabase/supabase-js";
import { publicInquirySchema } from "@/lib/admin/validation";

const responseHeaders = { "Cache-Control": "no-store" };

function jsonResponse(body: Record<string, string>, status: number) {
  return Response.json(body, { status, headers: responseHeaders });
}

async function readJsonBody(request: Request, maxBytes: number): Promise<unknown> {
  if (!request.body) throw new SyntaxError("Missing request body.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new RangeError("Request body too large.");
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return jsonResponse({ error: "Origen no permitido." }, 403);
      }
    } catch {
      return jsonResponse({ error: "Origen no válido." }, 400);
    }
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 12_000) return jsonResponse({ error: "La solicitud es demasiado grande." }, 413);

  let body: unknown;
  try {
    body = await readJsonBody(request, 12_000);
  } catch (error) {
    if (error instanceof RangeError) {
      return jsonResponse({ error: "La solicitud es demasiado grande." }, 413);
    }
    return jsonResponse({ error: "La solicitud no contiene JSON válido." }, 400);
  }

  const parsed = publicInquirySchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse(
      { error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados." },
      400,
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.error("No se puede registrar una consulta: faltan variables públicas de Supabase.");
    return jsonResponse({ error: "El formulario no está disponible en este momento. Inténtalo más tarde." }, 503);
  }

  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.rpc("submit_public_service_inquiry", {
    p_topic: parsed.data.topic,
    p_message: parsed.data.message,
    p_contact_name: parsed.data.contact_name ?? null,
    p_contact_phone: parsed.data.contact_phone ?? null,
    p_contact_email: parsed.data.contact_email ?? null,
    p_contact_consent: parsed.data.contact_consent,
  });

  if (error) {
    console.error("No se pudo guardar una consulta web.", error);
    return jsonResponse({ error: "No se pudo guardar la consulta. Inténtalo nuevamente más tarde." }, 503);
  }
  if (typeof data !== "string" || !data.startsWith("CONS-")) {
    console.error("Supabase no devolvió un código de consulta válido.");
    return jsonResponse({ error: "No se pudo confirmar el registro de la consulta." }, 503);
  }

  return Response.json(
    { inquiryNumber: data },
    { status: 201, headers: responseHeaders },
  );
}
