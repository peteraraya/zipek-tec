"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

export async function signInAdmin(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password || email.length > 254 || password.length > 1024) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) return { error: "No se pudo iniciar sesión con esas credenciales." };

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || !profile?.active) {
    if (profileError) console.error("No se pudo verificar el perfil al iniciar sesión", profileError);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("No se pudo cerrar la sesión sin permisos administrativos", signOutError);
    }
    return { error: "Esta cuenta no tiene acceso administrativo habilitado." };
  }

  redirect("/admin");
}

export async function signOutAdmin() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`No se pudo cerrar la sesión: ${error.message}`);
  redirect("/admin/login");
}
