import type { AdminDashboardRecentActivity } from "@hhlawyer/types";
import { Activity } from "lucide-react";
import Link from "next/link";
import { AdminDataState } from "@/components/admin/foundation";
import { localizePath } from "@/components/providers/LocaleProvider";
import { displayEnum, formatLocaleDateTime } from "@/i18n/format";
import type { Locale } from "@/i18n/locale";
import { messages } from "@/i18n/messages";
import type { dashboardContent } from "./dashboard-content";
import { activityHref } from "./dashboard-utils";
import styles from "./Dashboard.module.css";

type Copy = (typeof dashboardContent)[Locale];

export function DashboardActivity({ items, locale, copy }: { items: AdminDashboardRecentActivity[]; locale: Locale; copy: Copy }) {
  const activityLabels = messages[locale].admin.activity as Record<string, string>;
  return (
    <section aria-labelledby="dashboard-activity-title" className={`${styles.panel} ${styles.activityPanel}`} data-testid="dashboard-recent-activity">
      <header className={styles.panelHeader}><div><h2 id="dashboard-activity-title">{copy.recentActivity}</h2><p>{copy.recentActivityDescription}</p></div></header>
      {items.length ? (
        <ol className={styles.activityList}>
          {items.map((item) => {
            const href = activityHref(item.entity, item.entityId);
            const content = <><span className={styles.activityMarker}><Activity aria-hidden="true" size={15} /></span><span className={styles.activityBody}><strong>{activityLabels[item.action] ?? `${copy.activityFallback}: ${item.action}`}</strong><span>{item.actor ? `${item.actor.name} · ${displayEnum(locale, item.actor.role)}` : copy.system}</span><time dateTime={item.createdAt}>{formatLocaleDateTime(item.createdAt, locale)}</time></span></>;
            return <li key={item.id}>{href ? <Link className={styles.activityLink} href={localizePath(href, locale)}>{content}</Link> : <div className={styles.activityLink}>{content}</div>}</li>;
          })}
        </ol>
      ) : <AdminDataState description={copy.noActivityDescription} title={copy.noActivity} />}
    </section>
  );
}
