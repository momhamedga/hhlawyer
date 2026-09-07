import type { AdminDashboardRecentConsultation } from "@hhlawyer/types";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import { AdminDataState, AdminStatusBadge, AdminTechnicalValue } from "@/components/admin/foundation";
import { localizePath } from "@/components/providers/LocaleProvider";
import { displayEnum, formatLocaleDate, formatLocaleDateTime, localizeServiceTitle } from "@/i18n/format";
import type { Locale } from "@/i18n/locale";
import type { dashboardContent } from "./dashboard-content";
import { consultationTone } from "./dashboard-utils";
import styles from "./Dashboard.module.css";

type Copy = (typeof dashboardContent)[Locale];

export function DashboardConsultations({ items, locale, copy }: { items: AdminDashboardRecentConsultation[]; locale: Locale; copy: Copy }) {
  return (
    <section aria-labelledby="dashboard-consultations-title" className={`${styles.panel} ${styles.consultationsPanel}`} data-testid="dashboard-recent-consultations">
      <header className={styles.panelHeader}>
        <div><h2 id="dashboard-consultations-title">{copy.latestConsultations}</h2><p>{copy.latestConsultationsDescription}</p></div>
        <Link className={styles.sectionLink} href={localizePath("/admin/consultations", locale)}>{copy.viewAllConsultations}<ArrowUpRight aria-hidden="true" size={16} /></Link>
      </header>
      {items.length ? (
        <ul className={styles.recordList}>
          {items.map((item) => (
            <li key={item.id}>
              <Link className={styles.recordLink} href={localizePath(`/admin/consultations/${item.id}`, locale)}>
                <span className={styles.recordPrimary}><AdminTechnicalValue>{item.referenceNumber}</AdminTechnicalValue><span className={styles.recordTitle}>{localizeServiceTitle(locale, item.service)}</span></span>
                <span className={styles.recordMeta}>
                  <span><CalendarDays aria-hidden="true" size={15} />{copy.requestedDate}: {formatLocaleDate(item.preferredDate, locale)}</span>
                  <span>{copy.received}: {formatLocaleDateTime(item.createdAt, locale)}</span>
                </span>
                <AdminStatusBadge tone={consultationTone(item.status)}>{displayEnum(locale, item.status)}</AdminStatusBadge>
              </Link>
            </li>
          ))}
        </ul>
      ) : <AdminDataState description={copy.noConsultationsDescription} title={copy.noConsultations} />}
    </section>
  );
}
