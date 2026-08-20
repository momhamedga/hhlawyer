"use client";

import { useId, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui";

export function BookingInput({ label, error, id: suppliedId, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const generatedId = useId(); const id = suppliedId ?? generatedId; const errorId = `${id}-error`;
  return <label className="grid gap-2 text-sm font-bold text-card-foreground" htmlFor={id}><span>{label}</span><Input {...props} id={id} aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} />{error && <span id={errorId} role="alert" className="text-sm font-medium text-destructive">{error}</span>}</label>;
}
