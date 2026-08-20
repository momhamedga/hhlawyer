import type { TextareaHTMLAttributes } from "react";

import { cn } from "./cn";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-ds-md border border-input bg-card px-3 py-2 text-base text-card-foreground placeholder:text-muted-foreground aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
