import { inviteAdminUserAction, updateAdminUserAction } from "@/app/actions/admin-operations";
import { requireStaff } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  technician: "Técnico",
  support: "Atención",
  auditor: "Auditor",
};

type TeamMember = {
  id: string;
  email: string | null;
  display_name: string;
  role: string;
  active: boolean;
  created_at: string;
};

const errorMessages: Record<string, string> = {
  invalid: "Revisa los datos ingresados.",
  invite: "No se pudo enviar la invitación. Verifica Auth y el correo.",
  profile: "La invitación se envió, pero el perfil no quedó habilitado. Revisa la configuración antes de reenviar.",
  self: "No puedes desactivar tu propia cuenta.",
};

export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; invited?: string; saved?: string }>;
}) {
  const { supabase } = await requireStaff("users.manage");
  const [{ data, error }, params] = await Promise.all([
    supabase.from("admin_profiles").select("id,email,display_name,role,active,created_at").order("created_at"),
    searchParams,
  ]);
  if (error) throw new Error(`No se pudo cargar el equipo: ${error.message}`);
  const members = (data ?? []) as TeamMember[];

  return (
    <section className="space-y-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-light">Acceso</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Equipo y permisos</h1>
        <p className="mt-2 text-gray-400">Los cambios de rol y estado quedan registrados en la auditoría. Siempre debe permanecer un administrador activo.</p>
      </header>

      {params.invited && <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-200">Invitación enviada.</p>}
      {params.saved && <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-200">Perfil actualizado.</p>}
      {params.error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{errorMessages[params.error] ?? "No se pudo completar la operación."}</p>}

      <form action={inviteAdminUserAction} className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:grid-cols-4">
        <label className="text-sm text-gray-300">Nombre
          <input name="display_name" required minLength={2} maxLength={120} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white" />
        </label>
        <label className="text-sm text-gray-300">Correo
          <input name="email" type="email" required maxLength={254} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white" />
        </label>
        <label className="text-sm text-gray-300">Rol inicial
          <select name="role" defaultValue="support" className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white">
            {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button className="self-end rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-light">Invitar usuario</button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase text-gray-500"><tr>
            <th className="px-5 py-4">Persona</th><th className="px-5 py-4">Rol</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4">Alta</th><th className="px-5 py-4">Acción</th>
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {members.map((member) => (
              <tr key={member.id} className="text-gray-300">
                <td className="px-5 py-4"><strong className="block text-white">{member.display_name}</strong><span className="text-xs text-gray-500">{member.email ?? member.id}</span></td>
                <td className="px-5 py-4">{roleLabels[member.role] ?? member.role}</td>
                <td className="px-5 py-4">{member.active ? "Activo" : "Desactivado"}</td>
                <td className="px-5 py-4">{new Date(member.created_at).toLocaleDateString("es-CL")}</td>
                <td className="px-5 py-4">
                  <details>
                    <summary className="cursor-pointer text-primary-light">Editar permisos</summary>
                    <form action={updateAdminUserAction} className="mt-3 grid gap-3">
                      <input type="hidden" name="id" value={member.id} />
                      <select name="role" defaultValue={member.role} aria-label={`Rol de ${member.display_name}`} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white">
                        {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                      <label className="flex items-center gap-2"><input name="active" type="checkbox" defaultChecked={member.active} /> Acceso habilitado</label>
                      <button className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white hover:bg-white/5">Guardar</button>
                    </form>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
