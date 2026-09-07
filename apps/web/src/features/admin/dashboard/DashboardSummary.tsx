import type { AdminDashboardOverview } from "@hhlawyer/types";
import { BriefcaseBusiness, ClipboardCheck, MailWarning, Scale } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/i18n/locale";
import { formatLocaleNumber } from "@/i18n/format";
import { localizePath } from "@/components/providers/LocaleProvider";
import type { dashboardContent } from "./dashboard-content";
import styles from "./Dashboard.module.css";

type Copy = (typeof dashboardContent)[Locale];

export function DashboardSummary({ data, locale, copy }: { data: AdminDashboardOverview; locale: Locale; copy: Copy }) {
  const items = [
    {
      className: styles.attentionMetric,
      description: copy.attentionDescription,
      href: "/admin/consultations?status=PENDING",
      icon: ClipboardCheck,
      label: copy.attention,
      testId: "dashboard-consultations-card",
      value: data.consultations.byStatus.PENDING,
    },
    {
      description: copy.unreadDescription,
      href: "/admin/contacts",
      icon: MailWarning,
      label: copy.unreadMessages,
      testId: "dashboard-unread-contacts-card",
      value: data.contacts.unread,
    },
    {
      description: copy.newRequestsDescription,
      href: "/admin/consultations",
      icon: Scale,
      label: copy.newRequests,
      testId: "dashboard-new-requests-card",
      value: data.consultations.periodTotal,
    },
    {
      description: copy.activeServicesDescription,
      href: "/admin/services",
      icon: BriefcaseBusiness,
      label: copy.activeServices,
      testId: "dashboard-active-services-card",
      value: data.services.active,
    },
  ];

  return (
    <section aria-label={copy.attentionRegion} className={styles.summaryGrid}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link className={`${styles.metricLink} ${item.className ?? ""}`} data-testid={item.testId} href={localizePath(item.href, locale)} key={item.testId}>
            <span className={styles.metricIcon}><Icon aria-hidden="true" size={19} /></span>
            <span className={styles.metricCopy}>
              <span className={styles.metricLabel}>{item.label}</span>
              <span className={styles.metricDescription}>{item.description}</span>
            </span>
            <strong className={styles.metricValue}>{formatLocaleNumber(item.value, locale)}</strong>
          </Link>
        );
      })}
    </section>
  );
}
