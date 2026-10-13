import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireStaff() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/admin/login");

  const { data: profile, error } = await supabase
    .from("admin_profiles")
    .select("id, display_name, role, active")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw new Error(`No se pudo verificar el perfil administrativo: ${error.message}`);
  if (!profile?.active) redirect("/admin/login?error=unauthorized");

  return { supabase, user, profile };
}
