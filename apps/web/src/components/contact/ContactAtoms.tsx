"use client";

import { useId, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui";
import type { ContactDetail } from "@/constants/contact";

export function InfoCard({ item }: { item: ContactDetail; index: number }) {
  return <a className="flex min-h-20 items-center gap-4 rounded-ds-lg border border-border bg-card p-5 shadow-elevation-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={item.href}><span className="grid size-11 shrink-0 place-items-center rounded-ds-md bg-secondary text-primary">{item.icon}</span><span className="min-w-0"><span className="block text-xs font-bold text-muted-foreground">{item.label}</span><span className="mt-1 block truncate text-sm font-bold text-card-foreground">{item.value}</span></span></a>;
}

export function ContactInput({ label, error, id: suppliedId, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const generatedId = useId(); const id = suppliedId ?? generatedId; const errorId = `${id}-error`;
  return <label className="grid gap-2 text-sm font-bold text-card-foreground" htmlFor={id}><span>{label}</span><Input {...props} id={id} aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} />{error && <span id={errorId} role="alert" className="text-sm font-medium text-destructive">{error}</span>}</label>;
}
