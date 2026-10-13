"use client";

import { useActionState } from "react";
import { signInAdmin, type LoginState } from "@/app/actions/admin-auth";
import { AdminField, AdminInput, adminButtonClass } from "@/components/admin/AdminField";

export default function AdminLoginForm({ unauthorized }: { unauthorized: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signInAdmin, {});

  return (
    <form action={action} className="mt-8 space-y-5">
      {unauthorized && (
        <p role="alert" className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          Esta cuenta no tiene acceso administrativo habilitado.
        </p>
      )}
      {state.error && (
        <p role="alert" className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      )}
      <AdminField label="Correo electrónico">
        <AdminInput type="email" name="email" autoComplete="username" required maxLength={254} />
      </AdminField>
      <AdminField label="Contraseña">
        <AdminInput type="password" name="password" autoComplete="current-password" required maxLength={1024} />
      </AdminField>
      <button type="submit" disabled={pending} className={`${adminButtonClass} w-full`}>
        {pending ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
