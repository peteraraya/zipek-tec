import { createHash } from "node:crypto";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const proposalRequestSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  action: z.enum(["lookup", "respond"]),
  decision: z.enum(["accepted", "declined"]).optional(),
  signer_name: z.string().trim().min(2).max(160).optional(),
}).strict().superRefine((value, context) => {
  if (value.action === "respond" && (!value.decision || !value.signer_name)) {
    context.addIssue({ code: "custom", message: "Indica la decisión y el nombre para registrar la respuesta." });
  }
});

function jsonResponse(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function readJson(request: Request): Promise<unknown> {
  if (!request.body) throw new SyntaxError("Missing request body.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 4_000) {
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

  let body: unknown;
  try {
    body = await readJson(request);
  } catch (error) {
    if (error instanceof RangeError) return jsonResponse({ error: "La solicitud es demasiado grande." }, 413);
    return jsonResponse({ error: "La solicitud no contiene JSON válido." }, 400);
  }

  const parsed = proposalRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonResponse({ error: parsed.error.issues[0]?.message ?? "La solicitud no es válida." }, 400);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.error("No se puede consultar la propuesta: faltan variables públicas de Supabase.");
    return jsonResponse({ error: "La aprobación digital no está disponible en este momento." }, 503);
  }

  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");

  if (parsed.data.action === "lookup") {
    const { data, error } = await supabase.rpc("get_public_service_proposal", {
      p_token_hash: tokenHash,
    });
    if (error) {
      console.error("No se pudo cargar la propuesta digital.", error);
      return jsonResponse({ error: "No se pudo cargar la propuesta." }, 503);
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return jsonResponse({ error: "El enlace no es válido o la propuesta ya no está disponible." }, 404);
    }
    return jsonResponse({ proposal: data }, 200);
  }

  const { data, error } = await supabase.rpc("respond_to_service_proposal", {
    p_token_hash: tokenHash,
    p_decision: parsed.data.decision,
    p_signer_name: parsed.data.signer_name,
  });
  if (error) {
    console.error("No se pudo registrar la respuesta a la propuesta.", error);
    return jsonResponse({ error: "No se pudo registrar tu respuesta." }, 503);
  }

  if (data === "expired") return jsonResponse({ error: "El plazo de esta propuesta venció.", status: data }, 409);
  if (data === "not_found") return jsonResponse({ error: "El enlace no es válido o la propuesta ya no está disponible." }, 404);
  if (data === "already_responded") return jsonResponse({ error: "Esta propuesta ya recibió una respuesta. Contacta a Zipek si necesitas cambiarla.", status: data }, 409);
  if (data !== "accepted" && data !== "declined") {
    console.error("La base de datos devolvió un estado de propuesta no reconocido.");
    return jsonResponse({ error: "No se pudo confirmar tu respuesta." }, 503);
  }

  return jsonResponse({ status: data }, 200);
}
