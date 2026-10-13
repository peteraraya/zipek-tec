import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > 1024) {
    return Response.json({ error: "Solicitud inválida." }, { status: 413 });
  }

  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: "Solicitud inválida." }, { status: 400 });

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > 1024) {
      await reader.cancel();
      return Response.json({ error: "Solicitud inválida." }, { status: 413 });
    }
    chunks.push(value);
  }

  let payload: unknown;
  try {
    const body = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    payload = JSON.parse(new TextDecoder().decode(body));
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof (payload as { token?: unknown }).token !== "string"
  ) {
    return Response.json({ error: "Ingresa un código de seguimiento válido." }, { status: 400 });
  }

  const token = (payload as { token: string }).token;
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return Response.json({ error: "No encontramos un servicio con ese código." }, { status: 404 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.error("El seguimiento público requiere variables de entorno de Supabase.");
    return Response.json({ error: "El seguimiento no está disponible temporalmente." }, { status: 503 });
  }

  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { data, error } = await supabase.rpc("get_public_tracking_status", {
    p_token_hash: tokenHash,
  });

  if (error) {
    console.error("Fallo al consultar seguimiento de servicio", error);
    return Response.json({ error: "No se pudo consultar el seguimiento." }, { status: 500 });
  }

  const result = Array.isArray(data) ? data[0] : null;
  if (!result) {
    return Response.json({ error: "No encontramos un servicio con ese código." }, { status: 404 });
  }

  return Response.json(result, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
