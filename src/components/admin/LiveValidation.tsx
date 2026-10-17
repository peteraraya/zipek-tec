"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type FormEvent,
  type ChangeEvent,
  type FocusEvent,
  type FormHTMLAttributes,
  type ReactNode,
} from "react";
import { clientSchema } from "@/lib/admin/validation";

type FormErrors = Record<string, string>;

type ValidationContextValue = {
  errors: FormErrors;
  touched: Set<string>;
};

export type FormValidator = (values: Record<string, FormDataEntryValue>) => FormErrors;

type ValidationSchema = {
  safeParse(value: unknown):
    | { success: true }
    | {
        success: false;
        error: { issues: Array<{ path: PropertyKey[]; message: string; code: string; minimum?: number | bigint; maximum?: number | bigint; origin?: string }> };
      };
};

const ValidationContext = createContext<ValidationContextValue>({
  errors: {},
  touched: new Set(),
});

export function createZodFormValidator(schema: ValidationSchema): FormValidator {
  return (values) => {
    const result = schema.safeParse(values);
    if (result.success) return {};

    const errors: FormErrors = {};
    for (const issue of result.error.issues) {
      const fieldName = issue.path.map(String).join(".");
      if (!fieldName || errors[fieldName]) continue;

      let message = issue.message;
      if (issue.code === "invalid_type" && message.startsWith("Invalid input")) {
        message = "Completa este campo con un valor válido.";
      }
      if (issue.code === "invalid_format" && message.startsWith("Invalid")) {
        message = fieldName.includes("email") || fieldName === "recipient"
          ? "Ingresa un correo válido."
          : "Revisa el formato ingresado.";
      }
      if (issue.code === "invalid_value" && message.startsWith("Invalid")) {
        message = "Selecciona una opción válida.";
      }
      if (issue.code === "too_small" && message.startsWith("Too small")) {
        message = issue.origin === "string"
          ? `Escribe al menos ${String(issue.minimum)} caracteres.`
          : `El valor mínimo permitido es ${String(issue.minimum)}.`;
      }
      if (issue.code === "too_big" && message.startsWith("Too big")) {
        message = issue.origin === "string"
          ? `No superes los ${String(issue.maximum)} caracteres.`
          : `El valor máximo permitido es ${String(issue.maximum)}.`;
      }
      errors[fieldName] = message;
    }
    return errors;
  };
}

export function LiveValidation({
  validator,
  children,
  ...formProps
}: {
  validator: FormValidator;
  children: ReactNode;
} & Omit<FormHTMLAttributes<HTMLFormElement>, "noValidate" | "onChange" | "onBlur" | "onSubmit" | "onSubmitCapture">) {
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const context = useMemo(() => ({ errors, touched }), [errors, touched]);

  const validate = useCallback((form: HTMLFormElement) => {
    const values = Object.fromEntries(new FormData(form).entries());
    return validator(values);
  }, [validator]);

  function handleChange(event: ChangeEvent<HTMLFormElement>) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;
    const form = target.form;
    if (!form || !target.name) return;
    setTouched((current) => new Set(current).add(target.name));
    setErrors(validate(form));
  }

  function handleBlur(event: FocusEvent<HTMLFormElement>) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;
    const form = target.form;
    if (!form || !target.name) return;
    setTouched((current) => new Set(current).add(target.name));
    setErrors(validate(form));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
      setTouched(new Set(Array.from(form.elements)
        .filter((element): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement =>
          element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)
        .map((element) => element.name)
        .filter(Boolean)));
      const firstErrorField = Object.keys(nextErrors)[0];
      const firstInvalid = Array.from(form.elements).find(
        (element): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement =>
          (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)
          && element.name === firstErrorField,
      );
      firstInvalid?.focus();
    }
  }

  return (
    <ValidationContext.Provider value={context}>
      <form
        {...formProps}
        noValidate
        onChange={handleChange}
        onBlur={handleBlur}
        onSubmitCapture={handleSubmit}
      >
        {children}
      </form>
    </ValidationContext.Provider>
  );
}

export function ClientLiveValidation({
  children,
  ...formProps
}: Omit<FormHTMLAttributes<HTMLFormElement>, "noValidate" | "onChange" | "onBlur" | "onSubmit" | "onSubmitCapture"> & {
  children: ReactNode;
}) {
  return (
    <LiveValidation {...formProps} validator={createZodFormValidator(clientSchema)}>
      {children}
    </LiveValidation>
  );
}

export function useLiveFieldError(name?: string) {
  const { errors, touched } = useContext(ValidationContext);
  if (!name || !touched.has(name)) return undefined;
  return errors[name];
}

export function AdminValidationMessage({ name }: { name: string }) {
  const error = useLiveFieldError(name);
  if (!error) return null;
  return <span role="alert" className="mt-1 block text-xs font-medium text-red-300">{error}</span>;
}
