"use client";

import { Button } from "./button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog";

type ConfirmDialogProps = {
  cancelLabel?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  description: string;
  onConfirm: () => void;
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
};

export function ConfirmDialog({
  cancelLabel = "إلغاء",
  children,
  confirmLabel = "تأكيد",
  description,
  onConfirm,
  onOpenChange,
  open,
  title,
}: ConfirmDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        {children}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} variant="destructive">
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
