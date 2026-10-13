import Link from "next/link";
import { signOutAdmin } from "@/app/actions/admin-auth";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { siteConfig } from "@/config/site";

export default function AdminHeader({ name }: { name: string }) {
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
          <Link className="rounded-lg px-3 py-2 text-gray-300 hover:bg-white/5 hover:text-white" href="/admin/clientes">
            Clientes
          </Link>
          <Link className="rounded-lg px-3 py-2 text-gray-300 hover:bg-white/5 hover:text-white" href="/admin/ordenes">
            Órdenes
          </Link>
          <Link className="rounded-lg px-3 py-2 text-gray-300 hover:bg-white/5 hover:text-white" href="/admin/consultas">
            Consultas
          </Link>
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
