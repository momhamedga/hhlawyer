"use client";

import type { ConsultationStatus } from "@hhlawyer/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { AdminDialogContent, AdminTechnicalValue } from "@/components/admin/foundation";
import { Button, Dialog, DialogDescription, DialogTitle } from "@/components/ui";
import { useLocale } from "@/components/providers/LocaleProvider";
import { displayEnum } from "@/i18n/format";
import { adminConsultationsKeys, updateAdminConsultationStatus } from "@/lib/api/admin-consultations";
import { adminDashboardKeys } from "@/lib/api/admin-dashboard";
import { ApiClientError } from "@/lib/api/client";
import { consultationsContent } from "./consultations-content";
import { consultationTransitions } from "./consultations-model";
import styles from "./Consultations.module.css";

export function ConsultationActions({ canManage, id, reference, status }: { canManage: boolean; id: string; reference: string; status: ConsultationStatus }) {
  const locale = useLocale();
  const copy = consultationsContent[locale];
  const queryClient = useQueryClient();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [target, setTarget] = useState<ConsultationStatus | null>(null);
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null);
  const mutation = useMutation({
    mutationFn: (next: ConsultationStatus) => updateAdminConsultationStatus(id, next),
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminConsultationsKeys.all }),
        queryClient.invalidateQueries({ queryKey: adminDashboardKeys.all }),
      ]);
      closeDialog();
      setFeedback({ error: false, text: copy.updateSuccess });
    },
    onError: async (error) => {
      const code = error instanceof ApiClientError ? error.error.code : "NETWORK_ERROR";
      const text = code === "INVALID_STATUS_TRANSITION" ? copy.updateConflict : code === "FORBIDDEN" ? copy.updateForbidden : code === "CONSULTATION_NOT_FOUND" ? copy.updateNotFound : copy.updateError;
      if (code === "INVALID_STATUS_TRANSITION" || code === "CONSULTATION_NOT_FOUND") await queryClient.invalidateQueries({ queryKey: adminConsultationsKeys.all });
      closeDialog();
      setFeedback({ error: true, text });
    },
  });
  const closeDialog = () => {
    setTarget(null);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };
  const options = consultationTransitions[status];
  return <div className={styles.actions}>
    {!canManage ? <p className={styles.workflowNote}>{copy.readOnly}</p> : options.length === 0 ? <p className={styles.workflowNote}>{copy.terminal}</p> : <div className={styles.actionButtons}>{options.map((next) => <Button key={next} onClick={(event) => { triggerRef.current = event.currentTarget; setFeedback(null); setTarget(next); }} variant={next === "CANCELLED" ? "destructive" : "primary"}>{copy.actionLabels[next]}</Button>)}</div>}
    {feedback ? <p aria-live="polite" className={feedback.error ? styles.errorFeedback : styles.successFeedback} role={feedback.error ? "alert" : "status"}>{feedback.text}</p> : null}
    <Dialog onOpenChange={(open) => { if (!open && !mutation.isPending) closeDialog(); }} open={target !== null}><AdminDialogContent closeLabel={copy.cancel} onEscapeKeyDown={(event) => { if (mutation.isPending) event.preventDefault(); }}><DialogTitle>{target ? copy.dialogTitle(copy.actionLabels[target]) : copy.workflowTitle}</DialogTitle><DialogDescription>{target ? copy.dialogDescription(reference, displayEnum(locale, target)) : copy.workflowDescription}</DialogDescription><div className={styles.dialogReference}><span>{copy.reference}</span><AdminTechnicalValue>{reference}</AdminTechnicalValue></div><div className={styles.dialogFooter}><Button disabled={mutation.isPending} onClick={closeDialog} variant="outline">{copy.cancel}</Button><Button isLoading={mutation.isPending} onClick={() => target && mutation.mutate(target)} variant={target === "CANCELLED" ? "destructive" : "primary"}>{mutation.isPending ? copy.updating : copy.confirm}</Button></div></AdminDialogContent></Dialog>
  </div>;
}
