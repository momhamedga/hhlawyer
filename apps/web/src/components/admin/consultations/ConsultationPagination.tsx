"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import { messages } from "@/i18n/messages";

export function ConsultationPagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  const locale = useLocale();
  const t = messages[locale].admin.consultation;
  if (totalPages <= 1) return null;
  return (
    <nav aria-label={t.pagination} className="mt-5 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
      <button type="button" className="rounded border border-white/20 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>{messages[locale].common.previous}</button>
      <p aria-live="polite" className="text-sm text-white/70">{t.pageOf.replace("{page}", String(page)).replace("{totalPages}", String(totalPages))}</p>
      <button type="button" className="rounded border border-white/20 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>{messages[locale].common.next}</button>
    </nav>
  );
}
