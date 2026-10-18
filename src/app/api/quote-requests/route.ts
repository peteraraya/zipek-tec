import { createClient } from "@supabase/supabase-js";
import { publicQuoteRequestSchema } from "@/lib/admin/validation";

export const dynamic = "force-dynamic";

async function readJson(request: Request): Promise<unknown> {
  if (!request.body) throw new SyntaxError("Missing request body.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 12_000) {
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

function response(body: Record<string, string>, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return response({ error: "Origen no permitido." }, 403);
      }
    } catch {
      return response({ error: "Origen no válido." }, 400);
    }
  }

  let body: unknown;
  try {
    body = await readJson(request);
  } catch (error) {
    if (error instanceof RangeError) return response({ error: "La solicitud es demasiado grande." }, 413);
    return response({ error: "La solicitud no contiene JSON válido." }, 400);
  }

  const parsed = publicQuoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return response({ error: parsed.error.issues[0]?.message ?? "Revisa los datos ingresados." }, 400);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.error("No se puede registrar una cotización: faltan variables públicas de Supabase.");
    return response({ error: "El formulario no está disponible en este momento. Inténtalo más tarde." }, 503);
  }

  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase.rpc("submit_public_quote_request", {
    p_contact_name: parsed.data.contact_name,
    p_contact_phone: parsed.data.contact_phone,
    p_contact_email: parsed.data.contact_email ?? null,
    p_contact_consent: parsed.data.contact_consent,
    p_request_details: parsed.data.request_details,
  });

  if (error) {
    console.error("No se pudo registrar una solicitud de cotización.", error);
    return response({ error: "No se pudo guardar la solicitud. Inténtalo nuevamente más tarde." }, 503);
  }
  if (typeof data !== "string" || !data.startsWith("CONS-")) {
    console.error("Supabase no devolvió un código de solicitud de cotización válido.");
    return response({ error: "No se pudo confirmar el registro de la solicitud." }, 503);
  }

  return Response.json(
    { inquiryNumber: data },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
