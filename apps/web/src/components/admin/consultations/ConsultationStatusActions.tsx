"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ConsultationStatus } from "@hhlawyer/types";
import { consultationTransitions } from "@/lib/admin-consultations";
import { adminConsultationsKeys, updateAdminConsultationStatus } from "@/lib/api/admin-consultations";
import { ApiClientError } from "@/lib/api/client";
import { useLocale } from "@/components/providers/LocaleProvider";
import { displayEnum } from "@/i18n/format";
import { messages } from "@/i18n/messages";

export function ConsultationStatusActions({ id, status, canManage }: { id: string; status: ConsultationStatus; canManage: boolean }) {
  const locale = useLocale();
  const t = messages[locale].admin.consultation;
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (nextStatus: ConsultationStatus) => updateAdminConsultationStatus(id, nextStatus), retry: false,
    onSuccess: async () => { setConfirmCancel(false); setMessage(t.updateSuccess); await Promise.all([queryClient.invalidateQueries({ queryKey: adminConsultationsKeys.all }), queryClient.invalidateQueries({ queryKey: adminConsultationsKeys.detail(id) })]); },
    onError: async (error) => { const code = error instanceof ApiClientError ? error.error.code : "NETWORK_ERROR"; setMessage(code === "INVALID_STATUS_TRANSITION" ? t.staleStatus : code === "FORBIDDEN" ? t.updateForbidden : code === "CONSULTATION_NOT_FOUND" ? t.notFound : t.updateError); if (code === "INVALID_STATUS_TRANSITION") await queryClient.invalidateQueries({ queryKey: adminConsultationsKeys.detail(id) }); },
  });
  if (!canManage) return <p className="text-sm text-white/55">{t.readOnly}</p>;
  const options = consultationTransitions[status];
  if (options.length === 0) return <p className="text-sm text-white/55">{t.noActions}</p>;
  const update = (nextStatus: ConsultationStatus) => { if (nextStatus === "CANCELLED") { setConfirmCancel(true); return; } mutation.mutate(nextStatus); };
  return <div className="space-y-3"><div className="flex flex-wrap gap-2">{options.map((nextStatus) => <button key={nextStatus} type="button" disabled={mutation.isPending} onClick={() => update(nextStatus)} className="rounded border border-gold/60 px-3 py-2 text-sm font-bold text-gold-light disabled:opacity-50">{nextStatus === "CANCELLED" ? t.cancelRequest : t.changeTo.replace("{status}", displayEnum(locale, nextStatus))}</button>)}</div>{confirmCancel && <div role="alertdialog" aria-modal="true" aria-labelledby="cancel-title" className="rounded border border-rose-300/50 bg-rose-950/40 p-4"><p id="cancel-title" className="font-bold">{t.cancelConfirm}</p><div className="mt-3 flex gap-2"><button type="button" autoFocus disabled={mutation.isPending} onClick={() => mutation.mutate("CANCELLED")} className="rounded bg-rose-500 px-3 py-2 text-sm font-bold text-white">{t.confirmCancellation}</button><button type="button" disabled={mutation.isPending} onClick={() => setConfirmCancel(false)} className="rounded border border-white/30 px-3 py-2 text-sm">{messages[locale].common.back}</button></div></div>}<p aria-live="polite" role={mutation.isError ? "alert" : undefined} className={mutation.isError ? "text-sm text-rose-200" : "text-sm text-emerald-200"}>{message}</p></div>;
}
