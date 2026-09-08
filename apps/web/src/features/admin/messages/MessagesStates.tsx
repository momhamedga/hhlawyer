"use client";

import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { AdminDataState } from "@/components/admin/foundation";
import { Button } from "@/components/ui";
import type { Locale } from "@/i18n/locale";
import { messagesContent } from "./messages-content";
import styles from "./Messages.module.css";

export function MessagesListSkeleton({ locale }: { locale: Locale }) {
  const copy = messagesContent[locale];
  return <div aria-busy="true" aria-label={copy.loadingTitle} className={styles.listSkeleton} role="status"><span className={styles.srOnly}>{copy.loadingDescription}</span><div className={styles.skeletonToolbar} />{Array.from({ length: 5 }, (_, index) => <div className={styles.skeletonRow} key={index} />)}</div>;
}
export function MessageDetailSkeleton({ locale }: { locale: Locale }) {
  const copy = messagesContent[locale];
  return <div aria-busy="true" aria-label={copy.loadingTitle} className={styles.detailSkeleton} role="status"><div className={styles.skeletonHeading} /><div className={styles.skeletonPanel} /><div className={styles.skeletonPanel} /></div>;
}

export function MessagesEmpty({ filtered, locale, onClear }: { filtered: boolean; locale: Locale; onClear: () => void }) {
  const copy = messagesContent[locale];
  return <div className={styles.stateWrap}><Inbox aria-hidden="true" size={25} /><AdminDataState className={styles.state} description={filtered ? copy.filteredEmptyDescription : copy.emptyDescription} title={filtered ? copy.filteredEmptyTitle : copy.emptyTitle} />{filtered ? <Button onClick={onClear} variant="outline">{copy.clearFilters}</Button> : null}</div>;
}

export function MessagesError({ forbidden = false, locale, notFound = false, onRetry }: { forbidden?: boolean; locale: Locale; notFound?: boolean; onRetry: () => void }) {
  const copy = messagesContent[locale];
  const title = forbidden ? copy.forbiddenTitle : notFound ? copy.detailNotFoundTitle : copy.errorTitle;
  const description = forbidden ? copy.forbiddenDescription : notFound ? copy.detailNotFoundDescription : copy.errorDescription;
  return <div className={styles.stateWrap}><AlertTriangle aria-hidden="true" size={25} /><AdminDataState className={styles.state} description={description} title={title} tone="error" />{!forbidden && !notFound ? <Button onClick={onRetry} variant="outline"><RefreshCw aria-hidden="true" size={16} />{copy.retry}</Button> : null}</div>;
}
