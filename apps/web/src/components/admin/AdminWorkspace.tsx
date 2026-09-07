"use client";
import Link from "next/link";
import { BarChart3, CalendarDays, ContactRound, LayoutDashboard, Menu, Scale, UsersRound, Wrench } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import styles from "./AdminWorkspace.module.css";
const items=[["/admin",LayoutDashboard,"Overview","نظرة عامة"],["/admin/consultations",CalendarDays,"Matters","الملفات"],["/admin/contacts",ContactRound,"Contacts","التواصل"],["/admin/users",UsersRound,"Users","المستخدمون"],["/admin/services",Wrench,"Services","الخدمات"]] as const;
export function AdminWorkspace({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const t = (en: string, ar: string) => locale === "en" ? en : ar;
  const login = path.endsWith("/admin/login");
  const skipLabel = t("Skip to main content", "انتقل إلى المحتوى الرئيسي");

  if (login) {
    return (
      <div className={`${styles.workspace} ${styles.loginWorkspace}`} data-admin-root>
        <a className={styles.skipLink} href="#admin-main">{skipLabel}</a>
        <header className={styles.loginHeader} data-admin-shell="true">
          <Link aria-label={t("Admin home", "الرئيسية الإدارية")} href={localizePath("/admin", locale)}>
            <Scale aria-hidden="true" size={21}/>
            <span>H/LAW</span>
          </Link>
          <span>{t("Secure administration", "إدارة آمنة")}</span>
        </header>
        <main className={styles.loginContent} id="admin-main" tabIndex={-1}>
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className={styles.workspace} data-admin-root>
      <a className={styles.skipLink} href="#admin-main">{skipLabel}</a>
      <header className={styles.topbar} data-admin-shell="true">
        <button aria-expanded={open} aria-label={t("Open workspace navigation", "فتح تنقل مساحة العمل")} onClick={() => setOpen(!open)} type="button"><Menu aria-hidden="true" size={19}/></button>
        <Link href={localizePath("/admin", locale)}><Scale aria-hidden="true" size={21}/><span>H/LAW</span></Link>
        <div><span>{t("Secure workspace", "مساحة عمل آمنة")}</span><span className={styles.role}>ADMIN</span></div>
      </header>
      <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <p>{t("Operations", "العمليات")}</p>
        <nav aria-label={t("Admin navigation", "تنقل الإدارة")}>
          {items.map(([href, Icon, en, ar]) => {
            const destination = localizePath(href, locale);
            const active = path === destination || (href !== "/admin" && path.startsWith(`${destination}/`));
            return <Link aria-current={active ? "page" : undefined} className={active ? styles.active : ""} href={destination} key={href} onClick={() => setOpen(false)}><Icon aria-hidden="true" size={18}/><span>{t(en, ar)}</span></Link>;
          })}
        </nav>
        <footer><BarChart3 aria-hidden="true" size={17}/>{t("Live operational view", "عرض تشغيلي مباشر")}</footer>
      </aside>
      <main className={styles.content} id="admin-main" tabIndex={-1}>{children}</main>
    </div>
  );
}
