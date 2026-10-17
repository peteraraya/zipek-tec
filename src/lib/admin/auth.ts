import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminPermission =
  | "clients.read"
  | "clients.manage"
  | "orders.read"
  | "orders.manage"
  | "documents.read"
  | "documents.manage"
  | "inquiries.read"
  | "inquiries.manage"
  | "audit.read"
  | "settings.read"
  | "settings.manage"
  | "reports.read"
  | "users.manage";

export type AdminRole = "admin" | "technician" | "support" | "auditor";

const rolePermissions: Record<AdminRole, readonly AdminPermission[]> = {
  admin: [
    "clients.read", "clients.manage", "orders.read", "orders.manage",
    "documents.read", "documents.manage", "inquiries.read", "inquiries.manage",
    "audit.read", "settings.read", "settings.manage", "reports.read", "users.manage",
  ],
  technician: [
    "clients.read", "orders.read", "orders.manage", "documents.read",
    "documents.manage", "inquiries.read", "reports.read",
  ],
  support: [
    "clients.read", "clients.manage", "orders.read", "documents.read",
    "documents.manage", "inquiries.read", "inquiries.manage", "reports.read",
  ],
  auditor: [
    "clients.read", "orders.read", "documents.read", "inquiries.read",
    "audit.read", "settings.read", "reports.read",
  ],
};

export function hasAdminPermission(role: string, permission: AdminPermission) {
  return Object.hasOwn(rolePermissions, role)
    && rolePermissions[role as AdminRole].includes(permission);
}

export async function requireStaff(permission?: AdminPermission) {
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

  if (permission) {
    const { data: allowed, error: permissionError } = await supabase.rpc("has_admin_permission", {
      p_permission: permission,
    });
    if (permissionError) {
      throw new Error(`No se pudo verificar el permiso administrativo: ${permissionError.message}`);
    }
    if (!allowed) redirect("/admin?error=forbidden");
  }

  return { supabase, user, profile };
}
