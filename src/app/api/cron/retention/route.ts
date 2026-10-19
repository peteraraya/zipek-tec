import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("run_approved_data_retention");
  if (error) {
    console.error(JSON.stringify({
      event: "approved_retention_run_failed",
      error_code: error.code ?? "unknown",
    }));
    return Response.json({ error: "No se pudo completar la ejecución de retención." }, { status: 500 });
  }

  return Response.json({ status: "completed", ...data });
}
