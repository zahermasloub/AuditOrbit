"use client";

import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

type FormFieldProps = {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  children: ReactNode;
};

export function FormField({ name, label, description, required = false, children }: FormFieldProps) {
  const { formState } = useFormContext();
  const errorMessage = (formState.errors as Record<string, { message?: string }>)[name]?.message;
  const inputId = `ff-${name}`;
  const descriptionId = description ? `${inputId}-description` : undefined;

  return (
    <div role="group" aria-describedby={descriptionId} className="space-y-1">
      <label htmlFor={inputId} className="text-sm font-medium text-[rgb(var(--ao-fg))]">
        {label}
        {required ? <span className="text-[rgb(var(--ao-danger))]"> *</span> : null}
      </label>
      {children}
      {description ? (
        <p id={descriptionId} className="text-xs text-[rgb(var(--ao-muted))]">
          {description}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="text-xs text-[rgb(var(--ao-danger))]">{errorMessage}</p>
      ) : null}
    </div>
  );
}
