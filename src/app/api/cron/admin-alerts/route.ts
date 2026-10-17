import { Resend } from "resend";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type OperationalMetrics = {
  overdue_inquiries: number;
  overdue_urgent_orders: number;
  stale_orders: number;
  failed_document_emails_7d: number;
};

function getLocalDate(timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function isBusinessDay(timeZone: string) {
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(new Date());
  return day !== "Sat" && day !== "Sun";
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }
  const supabase = createSupabaseAdminClient();
  const { data: settings, error: settingsError } = await supabase
    .from("admin_settings")
    .select("alert_email,daily_alerts_enabled,timezone")
    .eq("id", true)
    .single();
  if (settingsError) throw new Error(`No se pudo cargar la configuración de alertas: ${settingsError.message}`);
  if (!settings.daily_alerts_enabled || !settings.alert_email) {
    return Response.json({ status: "disabled" });
  }

  if (!isBusinessDay(settings.timezone)) return Response.json({ status: "not_business_day" });
  const runDate = getLocalDate(settings.timezone);
  const { data: holiday, error: holidayError } = await supabase
    .from("admin_holidays")
    .select("holiday_date")
    .eq("holiday_date", runDate)
    .maybeSingle();
  if (holidayError) throw new Error(`No se pudo verificar el calendario laboral: ${holidayError.message}`);
  if (holiday) return Response.json({ status: "holiday" });

  const { data: claimed, error: claimError } = await supabase.rpc("claim_admin_alert_run", {
    p_run_date: runDate,
  });
  if (claimError) throw new Error(`No se pudo reservar la ejecución de alertas: ${claimError.message}`);
  if (!claimed) return Response.json({ status: "already_processed" });

  const { data: metrics, error: metricsError } = await supabase.rpc("get_admin_operational_metrics");
  if (metricsError) {
    await finishFailedRun(supabase, runDate, {
      overdue_inquiries: 0,
      overdue_urgent_orders: 0,
      stale_orders: 0,
      failed_document_emails_7d: 0,
    }, "metrics_error");
    throw new Error(`No se pudieron calcular las alertas: ${metricsError.message}`);
  }
  const values = metrics as OperationalMetrics;
  const counts = {
    overdue_inquiries: values.overdue_inquiries,
    overdue_urgent_orders: values.overdue_urgent_orders,
    stale_orders: values.stale_orders,
    failed_document_emails_7d: values.failed_document_emails_7d,
  };

  if (Object.values(counts).every((count) => count === 0)) {
    const { error } = await supabase.rpc("finish_admin_alert_run", {
      p_run_date: runDate,
      p_status: "no_alerts",
      p_metrics: counts,
      p_error_code: null,
    });
    if (error) throw new Error(`No se pudo registrar la ejecución sin alertas: ${error.message}`);
    return Response.json({ status: "no_alerts" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !sender) {
    await finishFailedRun(supabase, runDate, counts, "email_not_configured");
    return Response.json({ error: "El correo de alertas no está configurado." }, { status: 503 });
  }

  const resend = new Resend(apiKey);
  let sendError: unknown = null;
  try {
    const result = await resend.emails.send({
      from: sender,
      to: settings.alert_email,
      subject: "Resumen diario de operaciones · Zipek",
      html: `<main style="font-family:Arial,sans-serif;color:#202124">
        <h1>Alertas operativas</h1>
        <p>Resumen del ${runDate} (horario laboral configurado).</p>
        <ul>
          <li>Consultas fuera de plazo: ${counts.overdue_inquiries}</li>
          <li>Órdenes urgentes fuera de plazo: ${counts.overdue_urgent_orders}</li>
          <li>Órdenes sin actualización: ${counts.stale_orders}</li>
          <li>Fallos de correo de documentos (7 días): ${counts.failed_document_emails_7d}</li>
        </ul>
        <p>Entra al panel para revisar y asignar cada caso.</p>
      </main>`,
    });
    sendError = result.error;
  } catch {
    sendError = true;
  }
  if (sendError) {
    await finishFailedRun(supabase, runDate, counts, "email_provider_error");
    console.error("El proveedor rechazó el resumen diario de alertas.");
    return Response.json({ error: "No se pudo enviar el resumen de alertas." }, { status: 502 });
  }

  const { error: finishError } = await supabase.rpc("finish_admin_alert_run", {
    p_run_date: runDate,
    p_status: "sent",
    p_metrics: counts,
    p_error_code: null,
  });
  if (finishError) throw new Error(`El correo fue enviado, pero no se pudo registrar el resultado: ${finishError.message}`);

  return Response.json({ status: "sent" });
}

async function finishFailedRun(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  runDate: string,
  metrics: OperationalMetrics,
  errorCode: string,
) {
  const { error } = await supabase.rpc("finish_admin_alert_run", {
    p_run_date: runDate,
    p_status: "failed",
    p_metrics: metrics,
    p_error_code: errorCode,
  });
  if (error) throw new Error(`No se pudo registrar el fallo de alertas: ${error.message}`);
}
