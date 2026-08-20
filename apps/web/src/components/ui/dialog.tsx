"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "./cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & { closeLabel?: string };

export function DialogContent({ children, className, closeLabel = "Close", ...props }: DialogContentProps) {
  return <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
    <DialogPrimitive.Content className={cn("fixed start-1/2 top-1/2 z-50 w-[min(calc(100%-2rem),32rem)] -translate-x-1/2 -translate-y-1/2 rounded-ds-lg border border-border bg-popover p-6 text-popover-foreground shadow-elevation-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} {...props}>
      {children}
      <DialogPrimitive.Close aria-label={closeLabel} className="absolute end-4 top-4 rounded-ds-sm p-1 text-muted-foreground hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><X aria-hidden="true" className="size-4" /></DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>;
}

export function DialogTitle(props: ComponentProps<typeof DialogPrimitive.Title>) { return <DialogPrimitive.Title className="pe-8 text-lg font-extrabold" {...props} />; }
export function DialogDescription(props: ComponentProps<typeof DialogPrimitive.Description>) { return <DialogPrimitive.Description className="mt-2 text-sm leading-6 text-muted-foreground" {...props} />; }
