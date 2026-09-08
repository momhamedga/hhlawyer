"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";
import type { Locale } from "@/i18n/locale";
import { messagesContent } from "./messages-content";
import styles from "./Messages.module.css";

export function MessagesPagination({ locale, page, totalPages, onPageChange }: { locale: Locale; page: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  const copy = messagesContent[locale];
  const PreviousIcon = locale === "ar" ? ChevronRight : ChevronLeft;
  const NextIcon = locale === "ar" ? ChevronLeft : ChevronRight;
  return <nav aria-label={copy.pageSummary(page, totalPages)} className={styles.pagination}>
    <Button aria-label={copy.previous} disabled={page <= 1} onClick={() => onPageChange(page - 1)} variant="outline"><PreviousIcon aria-hidden="true" size={16} /><span>{copy.previous}</span></Button>
    <p aria-live="polite">{copy.pageSummary(page, totalPages)}</p>
    <Button aria-label={copy.next} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} variant="outline"><span>{copy.next}</span><NextIcon aria-hidden="true" size={16} /></Button>
  </nav>;
}
