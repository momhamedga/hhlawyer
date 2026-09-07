import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import type { Locale } from "@/i18n/locale";
import type { dashboardContent } from "./dashboard-content";
import styles from "./Dashboard.module.css";

type Copy = (typeof dashboardContent)[Locale];

export function DashboardSkeleton({ label }: { label: string }) {
  return <div aria-label={label} aria-live="polite" aria-busy="true" className={styles.skeletonLayout} data-testid="dashboard-loading" role="status"><div className={styles.skeletonSummary}><span /><span /><span /><span /></div><div className={styles.skeletonContent}><span /><span /><span /><span /></div></div>;
}

export function DashboardError({ copy, onRetry }: { copy: Copy; onRetry: () => void }) {
  return <div className={styles.errorState} role="alert"><span className={styles.errorIcon}><AlertCircle aria-hidden="true" size={21} /></span><div><h2>{copy.loadError}</h2><p>{copy.loadErrorDescription}</p></div><Button data-testid="dashboard-retry" onClick={onRetry} variant="outline">{copy.retry}</Button></div>;
}
