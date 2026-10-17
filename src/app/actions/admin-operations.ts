"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";

export async function saveHolidayCalendarAction(formData: FormData) {
  const { supabase } = await requireStaff("settings.manage");
  const raw = String(formData.get("holidays") ?? "");
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length > 40) redirect("/admin/configuracion?error=holidays");

  const holidays: Array<{ holiday_date: string; name: string }> = [];
  for (const line of lines) {
    const [date, ...nameParts] = line.split("|");
    const holidayDate = date.trim();
    const parsedDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).safeParse(holidayDate);
    if (
      !parsedDate.success
      || Number.isNaN(Date.parse(`${holidayDate}T00:00:00.000Z`))
      || new Date(`${holidayDate}T00:00:00.000Z`).toISOString().slice(0, 10) !== holidayDate
      || nameParts.join("|").trim().length > 120
      || holidays.some((holiday) => holiday.holiday_date === holidayDate)
    ) {
      redirect("/admin/configuracion?error=holidays");
    }
    holidays.push({ holiday_date: holidayDate, name: nameParts.join("|").trim() });
  }

  const { error } = await supabase.rpc("set_admin_holidays", { p_holidays: holidays });
  if (error) throw new Error(`No se pudo guardar el calendario de feriados: ${error.message}`);

  revalidatePath("/admin");
  revalidatePath("/admin/configuracion");
  redirect("/admin/configuracion?holidaysSaved=1");
}

const roleSchema = z.enum(["admin", "technician", "support", "auditor"]);
const settingsSchema = z.object({
  inquiry_response_sla_hours: z.coerce.number().int().min(1).max(720),
  urgent_order_sla_hours: z.coerce.number().int().min(1).max(720),
  stale_order_hours: z.coerce.number().int().min(1).max(720),
  workday_start: z.string().regex(/^\d{2}:\d{2}$/),
  workday_end: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.string().min(1).max(80),
  retention_clients_days: z.preprocess((value) => value === "" ? null : value, z.coerce.number().int().min(30).max(3650).nullable()),
  retention_inquiries_days: z.preprocess((value) => value === "" ? null : value, z.coerce.number().int().min(30).max(3650).nullable()),
  retention_documents_days: z.preprocess((value) => value === "" ? null : value, z.coerce.number().int().min(30).max(3650).nullable()),
  retention_orders_days: z.preprocess((value) => value === "" ? null : value, z.coerce.number().int().min(30).max(3650).nullable()),
  alert_email: z.preprocess((value) => value === "" ? null : value, z.string().trim().email().max(254).nullable()),
  daily_alerts_enabled: z.preprocess((value) => value === "on", z.boolean()),
});

export async function saveAdminSettingsAction(formData: FormData) {
  const { supabase, user } = await requireStaff("settings.manage");
  const values = Object.fromEntries(formData.entries());
  const parsed = settingsSchema.safeParse(values);
  if (!parsed.success) redirect("/admin/configuracion?error=invalid");

  const [startHour, startMinute] = parsed.data.workday_start.split(":").map(Number);
  const [endHour, endMinute] = parsed.data.workday_end.split(":").map(Number);
  if (
    startHour > 23 || startMinute > 59
    || endHour > 23 || endMinute > 59
  ) {
    redirect("/admin/configuracion?error=invalid");
  }
  if (endHour * 60 + endMinute <= startHour * 60 + startMinute) {
    redirect("/admin/configuracion?error=hours");
  }

  try {
    new Intl.DateTimeFormat("es-CL", { timeZone: parsed.data.timezone });
  } catch {
    redirect("/admin/configuracion?error=timezone");
  }

  const { error } = await supabase
    .from("admin_settings")
    .update({ ...parsed.data, updated_by: user.id })
    .eq("id", true);
  if (error) throw new Error(`No se pudo guardar la configuración: ${error.message}`);

  revalidatePath("/admin");
  revalidatePath("/admin/configuracion");
  redirect("/admin/configuracion?saved=1");
}

const inviteSchema = z.object({
  email: z.string().trim().email("Ingresa un correo válido.").max(254),
  display_name: z.string().trim().min(2).max(120),
  role: roleSchema,
});

export async function inviteAdminUserAction(formData: FormData) {
  const { supabase } = await requireStaff("users.manage");
  const parsed = inviteSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/usuarios?error=invalid");

  const adminClient = createSupabaseAdminClient();
  const redirectTo = new URL("/admin/login", process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url).toString();
  const { data, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    parsed.data.email,
    { data: { display_name: parsed.data.display_name }, redirectTo },
  );
  if (inviteError || !data.user) {
    redirect("/admin/usuarios?error=invite");
  }

  const { error: profileError } = await supabase.from("admin_profiles").insert({
    id: data.user.id,
    email: parsed.data.email,
    display_name: parsed.data.display_name,
    role: parsed.data.role,
    active: true,
  });
  if (profileError) {
    console.error("La invitación fue creada, pero no se pudo habilitar el perfil administrativo.", profileError);
    redirect("/admin/usuarios?error=profile");
  }

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios?invited=1");
}

const updateUserSchema = z.object({
  id: z.string().uuid(),
  role: roleSchema,
  active: z.preprocess((value) => value === "on", z.boolean()),
});

export async function updateAdminUserAction(formData: FormData) {
  const { supabase, user } = await requireStaff("users.manage");
  const parsed = updateUserSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/usuarios?error=invalid");
  if (parsed.data.id === user.id && !parsed.data.active) {
    redirect("/admin/usuarios?error=self");
  }

  const { error } = await supabase
    .from("admin_profiles")
    .update({ role: parsed.data.role, active: parsed.data.active })
    .eq("id", parsed.data.id);
  if (error) throw new Error(`No se pudo actualizar el perfil. Comprueba que quede un administrador activo: ${error.message}`);

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
  redirect("/admin/usuarios?saved=1");
}
