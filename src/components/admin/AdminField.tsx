"use client";

import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useLiveFieldError } from "@/components/admin/LiveValidation";

const controlClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export function AdminField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-gray-300">
      {label}
      {children}
    </label>
  );
}

function validationAttributes(
  name: string | undefined,
  error: string | undefined,
  describedBy: string | undefined,
  ariaInvalid: InputHTMLAttributes<HTMLInputElement>["aria-invalid"],
) {
  return {
    "aria-invalid": error ? true : ariaInvalid,
    "aria-describedby": [describedBy, error && name ? `${name}-error` : undefined].filter(Boolean).join(" ") || undefined,
  };
}

function ValidationError({ name, error }: { name?: string; error?: string }) {
  if (!name || !error) return null;
  return <span id={`${name}-error`} role="alert" className="mt-1 block text-xs font-medium text-red-300">{error}</span>;
}

export function AdminInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const error = useLiveFieldError(props.name);
  return (
    <>
      <input
        {...props}
        {...validationAttributes(props.name, error, props["aria-describedby"], props["aria-invalid"])}
        className={`${controlClass} ${error ? "border-red-400 focus:border-red-300 focus:ring-red-400/20" : ""} ${props.className ?? ""}`}
      />
      <ValidationError name={props.name} error={error} />
    </>
  );
}

export function AdminTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const error = useLiveFieldError(props.name);
  return (
    <>
      <textarea
        {...props}
        {...validationAttributes(props.name, error, props["aria-describedby"], props["aria-invalid"])}
        className={`${controlClass} ${error ? "border-red-400 focus:border-red-300 focus:ring-red-400/20" : ""} ${props.className ?? ""}`}
      />
      <ValidationError name={props.name} error={error} />
    </>
  );
}

export function AdminSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const error = useLiveFieldError(props.name);
  return (
    <>
      <select
        {...props}
        {...validationAttributes(props.name, error, props["aria-describedby"], props["aria-invalid"])}
        className={`${controlClass} ${error ? "border-red-400 focus:border-red-300 focus:ring-red-400/20" : ""} ${props.className ?? ""}`}
      />
      <ValidationError name={props.name} error={error} />
    </>
  );
}

export const adminButtonClass =
  "inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60";
export const adminSecondaryButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/10";
