import Link from "next/link";
import { signOutAdmin } from "@/app/actions/admin-auth";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { siteConfig } from "@/config/site";
import { hasAdminPermission, type AdminRole } from "@/lib/admin/auth";

export default function AdminHeader({ name, role }: { name: string; role: AdminRole }) {
  return (
    <header className="border-b border-white/10 bg-black/20">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <Link href="/admin" className="text-xl font-bold tracking-tight text-white">
            {siteConfig.shortName} <span className="text-primary-light">/ Administración</span>
          </Link>
          <p className="mt-1 text-sm text-gray-400">Sesión: {name}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <ThemeToggle />
          {hasAdminPermission(role, "clients.read") && (
            <Link className="rounded-lg px-3 py-2 text-gray-300 hover:bg-white/5 hover:text-white" href="/admin/clientes">Clientes</Link>
          )}
          {hasAdminPermission(role, "orders.read") && (
            <Link className="rounded-lg px-3 py-2 text-gray-300 hover:bg-white/5 hover:text-white" href="/admin/ordenes">Órdenes</Link>
          )}
          {hasAdminPermission(role, "documents.read") && (
            <Link className="rounded-lg px-3 py-2 text-gray-300 hover:bg-white/5 hover:text-white" href="/admin/documentos">Documentos</Link>
          )}
          {hasAdminPermission(role, "inquiries.read") && (
            <Link className="rounded-lg px-3 py-2 text-gray-300 hover:bg-white/5 hover:text-white" href="/admin/consultas">Consultas</Link>
          )}
          {hasAdminPermission(role, "audit.read") && (
            <Link className="rounded-lg px-3 py-2 text-gray-300 hover:bg-white/5 hover:text-white" href="/admin/auditoria">Auditoría</Link>
          )}
          {hasAdminPermission(role, "settings.read") && (
            <Link className="rounded-lg px-3 py-2 text-gray-300 hover:bg-white/5 hover:text-white" href="/admin/configuracion">Configuración</Link>
          )}
          {hasAdminPermission(role, "users.manage") && (
            <Link className="rounded-lg px-3 py-2 text-gray-300 hover:bg-white/5 hover:text-white" href="/admin/usuarios">Equipo</Link>
          )}
          <Link className="rounded-lg px-3 py-2 text-gray-300 hover:bg-white/5 hover:text-white" href="/seguimiento">
            Seguimiento público
          </Link>
          <form action={signOutAdmin}>
            <button className="rounded-lg border border-white/10 px-3 py-2 text-gray-300 hover:bg-white/5 hover:text-white">
              Cerrar sesión
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
