import type { AdminDashboardRecentContact } from "@hhlawyer/types";
import { ArrowUpRight, MailOpen } from "lucide-react";
import Link from "next/link";
import { AdminDataState, AdminStatusBadge } from "@/components/admin/foundation";
import { localizePath } from "@/components/providers/LocaleProvider";
import { displayEnum, formatLocaleDateTime } from "@/i18n/format";
import type { Locale } from "@/i18n/locale";
import type { dashboardContent } from "./dashboard-content";
import { contactTone } from "./dashboard-utils";
import styles from "./Dashboard.module.css";

type Copy = (typeof dashboardContent)[Locale];

export function DashboardMessages({ items, locale, copy }: { items: AdminDashboardRecentContact[]; locale: Locale; copy: Copy }) {
  return (
    <section aria-labelledby="dashboard-messages-title" className={`${styles.panel} ${styles.messagesPanel}`} data-testid="dashboard-recent-contacts">
      <header className={styles.panelHeader}>
        <div><h2 id="dashboard-messages-title">{copy.recentMessages}</h2><p>{copy.recentMessagesDescription}</p></div>
        <Link className={styles.sectionLink} href={localizePath("/admin/contacts", locale)}>{copy.viewAllMessages}<ArrowUpRight aria-hidden="true" size={16} /></Link>
      </header>
      {items.length ? (
        <ul className={styles.messageList}>
          {items.map((item) => (
            <li key={item.id}>
              <Link className={styles.messageLink} href={localizePath(`/admin/contacts/${item.id}`, locale)}>
                <span className={styles.messageIcon}><MailOpen aria-hidden="true" size={17} /></span>
                <span className={styles.messageBody}><strong>{item.subject}</strong><span>{formatLocaleDateTime(item.createdAt, locale)}</span></span>
                <AdminStatusBadge tone={contactTone(item.status)}>{displayEnum(locale, item.status)}</AdminStatusBadge>
              </Link>
            </li>
          ))}
        </ul>
      ) : <AdminDataState description={copy.noMessagesDescription} title={copy.noMessages} />}
    </section>
  );
}
