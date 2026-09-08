"use client";

import type { ContactMessageStatus } from "@hhlawyer/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { AdminDialogContent } from "@/components/admin/foundation";
import { Button, Dialog, DialogDescription, DialogTitle } from "@/components/ui";
import { useLocale } from "@/components/providers/LocaleProvider";
import { displayEnum } from "@/i18n/format";
import { adminContactsKeys, updateAdminContactStatus } from "@/lib/api/admin-contacts";
import { adminDashboardKeys } from "@/lib/api/admin-dashboard";
import { ApiClientError } from "@/lib/api/client";
import { messagesContent } from "./messages-content";
import { messageTransitions } from "./messages-model";
import styles from "./Messages.module.css";

export function MessageActions({ canManage, id, status, subject }: { canManage: boolean; id: string; status: ContactMessageStatus; subject: string }) {
  const locale = useLocale();
  const copy = messagesContent[locale];
  const queryClient = useQueryClient();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [target, setTarget] = useState<ContactMessageStatus | null>(null);
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null);
  const closeDialog = () => {
    setTarget(null);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };
  const mutation = useMutation({
    mutationFn: (next: ContactMessageStatus) => updateAdminContactStatus(id, next),
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminContactsKeys.all }),
        queryClient.invalidateQueries({ queryKey: adminDashboardKeys.all }),
      ]);
      closeDialog();
      setFeedback({ error: false, text: copy.updateSuccess });
    },
    onError: async (error) => {
      const code = error instanceof ApiClientError ? error.error.code : "NETWORK_ERROR";
      const text = code === "INVALID_CONTACT_STATUS_TRANSITION" ? copy.updateConflict : code === "FORBIDDEN" ? copy.updateForbidden : code === "CONTACT_MESSAGE_NOT_FOUND" ? copy.updateNotFound : copy.updateError;
      if (code === "INVALID_CONTACT_STATUS_TRANSITION" || code === "CONTACT_MESSAGE_NOT_FOUND") {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: adminContactsKeys.all }),
          queryClient.invalidateQueries({ queryKey: adminDashboardKeys.all }),
        ]);
      }
      closeDialog();
      setFeedback({ error: true, text });
    },
  });
  const options = messageTransitions[status];

  return <div className={styles.actions}>
    {!canManage ? <p className={styles.workflowNote} data-testid="contact-readonly-state">{copy.readOnly}</p> : options.length === 0 ? <p className={styles.workflowNote}>{copy.terminal}</p> : <div className={styles.actionButtons} data-testid="contact-status-actions">{options.map((next) => <Button data-testid={`contact-status-action-${next}`} key={next} onClick={(event) => { triggerRef.current = event.currentTarget; setFeedback(null); setTarget(next); }} variant={next === "ARCHIVED" ? "destructive" : "primary"}>{copy.actionLabels[next]}</Button>)}</div>}
    {feedback ? <p aria-live="polite" className={feedback.error ? styles.errorFeedback : styles.successFeedback} role={feedback.error ? "alert" : "status"}>{feedback.text}</p> : null}
    <Dialog onOpenChange={(open) => { if (!open && !mutation.isPending) closeDialog(); }} open={target !== null}><AdminDialogContent closeLabel={copy.cancel} data-testid={target === "ARCHIVED" ? "contact-archive-dialog" : "contact-status-dialog"} onEscapeKeyDown={(event) => { if (mutation.isPending) event.preventDefault(); }}><DialogTitle>{target ? copy.dialogTitle(copy.actionLabels[target]) : copy.workflowTitle}</DialogTitle><DialogDescription>{target ? copy.dialogDescription(subject, displayEnum(locale, target)) : copy.workflowDescription}</DialogDescription><div className={styles.dialogContext}><span>{copy.subject}</span><strong>{subject}</strong></div><div className={styles.dialogFooter}><Button data-testid={target === "ARCHIVED" ? "contact-archive-cancel" : undefined} disabled={mutation.isPending} onClick={closeDialog} variant="outline">{copy.cancel}</Button><Button data-testid={target === "ARCHIVED" ? "contact-archive-confirm" : "contact-status-confirm"} isLoading={mutation.isPending} onClick={() => target && mutation.mutate(target)} variant={target === "ARCHIVED" ? "destructive" : "primary"}>{mutation.isPending ? copy.updating : copy.confirm}</Button></div></AdminDialogContent></Dialog>
  </div>;
}
