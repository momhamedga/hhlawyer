import type { InputHTMLAttributes } from "react";

import { cn } from "./cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-ds-md border border-input bg-card px-3 text-base text-card-foreground placeholder:text-muted-foreground aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
