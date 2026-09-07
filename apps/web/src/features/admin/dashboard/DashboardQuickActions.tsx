import { ArrowUpRight, BriefcaseBusiness, Mail, Scale, Users } from "lucide-react";
import Link from "next/link";
import { localizePath } from "@/components/providers/LocaleProvider";
import type { Locale } from "@/i18n/locale";
import type { dashboardContent } from "./dashboard-content";
import styles from "./Dashboard.module.css";

type Copy = (typeof dashboardContent)[Locale];

export function DashboardQuickActions({ locale, copy }: { locale: Locale; copy: Copy }) {
  const actions = [
    { description: copy.consultationsActionDescription, href: "/admin/consultations", icon: Scale, label: copy.consultationsAction, testId: "dashboard-consultations-action" },
    { description: copy.messagesActionDescription, href: "/admin/contacts", icon: Mail, label: copy.messagesAction, testId: "dashboard-messages-action" },
    { description: copy.servicesActionDescription, href: "/admin/services", icon: BriefcaseBusiness, label: copy.servicesAction, testId: "dashboard-services-action" },
    { description: copy.teamActionDescription, href: "/admin/users", icon: Users, label: copy.teamAction, testId: "dashboard-active-users-card" },
  ];
  return (
    <section aria-labelledby="dashboard-quick-title" className={`${styles.panel} ${styles.quickPanel}`}>
      <header className={styles.panelHeader}><div><h2 id="dashboard-quick-title">{copy.quickActions}</h2><p>{copy.quickActionsDescription}</p></div></header>
      <nav aria-label={copy.quickActions} className={styles.quickLinks}>
        {actions.map((action) => {
          const Icon = action.icon;
          return <Link data-testid={action.testId} href={localizePath(action.href, locale)} key={action.href}><span className={styles.quickIcon}><Icon aria-hidden="true" size={18} /></span><span><strong>{action.label}</strong><small>{action.description}</small></span><ArrowUpRight aria-hidden="true" className={styles.quickArrow} size={16} /></Link>;
        })}
      </nav>
    </section>
  );
}
