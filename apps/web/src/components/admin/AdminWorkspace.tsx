"use client";

import type { AuthUser, UserRole } from "@hhlawyer/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  ContactRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Scale,
  UserRound,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AdminBreadcrumbs,
  AdminDialogContent,
  type AdminBreadcrumbItem,
} from "@/components/admin/foundation";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Dialog, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Locale } from "@/i18n/locale";
import { currentUser, logout } from "@/lib/api/auth";
import styles from "./AdminWorkspace.module.css";

type ShellPermission = "DASHBOARD_READ" | "CONSULTATION_READ" | "CONTACT_READ" | "USER_MANAGE" | "SERVICE_READ";
type NavigationItem = {
  href: string;
  icon: LucideIcon;
  id: "overview" | "consultations" | "messages" | "team" | "services";
  label: Record<Locale, string>;
  permission: ShellPermission;
};

const shellCopy = {
  ar: {
    account: "الحساب",
    accountDescription: "إعدادات الحساب ومساحة الإدارة",
    administration: "لوحة الإدارة",
    breadcrumb: "مسار الإدارة",
    close: "إغلاق",
    loading: "جارٍ التحقق من الجلسة…",
    locale: "اللغة",
    logout: "تسجيل الخروج",
    logoutError: "تعذر تسجيل الخروج. حاول مرة أخرى.",
    mobileDescription: "التنقل وإعدادات حساب الإدارة",
    navigation: "تنقل الإدارة",
    openAccount: "فتح قائمة الحساب",
    openNavigation: "فتح تنقل الإدارة",
    secureAdministration: "إدارة آمنة",
    skip: "انتقل إلى المحتوى الرئيسي",
    record: "السجل",
  },
  en: {
    account: "Account",
    accountDescription: "Account and administration workspace settings",
    administration: "Administration",
    breadcrumb: "Administration breadcrumb",
    close: "Close",
    loading: "Checking session…",
    locale: "Language",
    logout: "Log out",
    logoutError: "Log out failed. Try again.",
    mobileDescription: "Administration navigation and account settings",
    navigation: "Administration navigation",
    openAccount: "Open account menu",
    openNavigation: "Open administration navigation",
    secureAdministration: "Secure administration",
    skip: "Skip to main content",
    record: "Record",
  },
} as const;

const roleLabels: Record<UserRole, Record<Locale, string>> = {
  ADMIN: { ar: "مدير النظام", en: "Administrator" },
  LAWYER: { ar: "محامٍ", en: "Lawyer" },
  STAFF: { ar: "موظف", en: "Staff" },
};

// Presentation mirrors the current API permission source; the API remains the authority.
const permissionPresentation: Record<UserRole, ReadonlySet<ShellPermission>> = {
  ADMIN: new Set(["DASHBOARD_READ", "CONSULTATION_READ", "CONTACT_READ", "USER_MANAGE", "SERVICE_READ"]),
  LAWYER: new Set(["CONSULTATION_READ", "CONTACT_READ"]),
  STAFF: new Set(["CONSULTATION_READ", "CONTACT_READ"]),
};

const navigationGroups: Array<{ id: string; label: Record<Locale, string>; items: NavigationItem[] }> = [
  {
    id: "overview",
    label: { ar: "نظرة عامة", en: "Overview" },
    items: [{ href: "/admin", icon: LayoutDashboard, id: "overview", label: { ar: "نظرة عامة", en: "Overview" }, permission: "DASHBOARD_READ" }],
  },
  {
    id: "operations",
    label: { ar: "العمليات", en: "Operations" },
    items: [
      { href: "/admin/consultations", icon: CalendarDays, id: "consultations", label: { ar: "طلبات الاستشارة", en: "Consultations" }, permission: "CONSULTATION_READ" },
      { href: "/admin/contacts", icon: ContactRound, id: "messages", label: { ar: "الرسائل", en: "Messages" }, permission: "CONTACT_READ" },
    ],
  },
  {
    id: "management",
    label: { ar: "الإدارة", en: "Management" },
    items: [
      { href: "/admin/users", icon: UsersRound, id: "team", label: { ar: "الفريق والصلاحيات", en: "Team & Access" }, permission: "USER_MANAGE" },
      { href: "/admin/services", icon: Wrench, id: "services", label: { ar: "الخدمات", en: "Services" }, permission: "SERVICE_READ" },
    ],
  },
];

const allNavigationItems = navigationGroups.flatMap((group) => group.items);

function isActivePath(pathname: string, locale: Locale, href: string) {
  const destination = localizePath(href, locale);
  return pathname === destination || (href !== "/admin" && pathname.startsWith(`${destination}/`));
}

function permittedGroups(role: UserRole) {
  return navigationGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => permissionPresentation[role].has(item.permission)) }))
    .filter((group) => group.items.length > 0);
}

function landingPath(role: UserRole) {
  return role === "ADMIN" ? "/admin" : "/admin/consultations";
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase() || "H";
}

function breadcrumbItems(pathname: string, locale: Locale): AdminBreadcrumbItem[] {
  const copy = shellCopy[locale];
  const active = allNavigationItems.find((item) => isActivePath(pathname, locale, item.href));
  if (!active) return [{ label: copy.administration }];
  const destination = localizePath(active.href, locale);
  if (pathname === destination) return [{ label: active.label[locale] }];
  const recordId = pathname.slice(destination.length + 1).split("/")[0];
  return [
    { href: destination, label: active.label[locale] },
    { label: `${copy.record} ${recordId}`, technical: true },
  ];
}

function Brand({ href, locale }: { href: string; locale: Locale }) {
  const copy = shellCopy[locale];
  return (
    <Link className={styles.brand} href={href}>
      <span className={styles.brandMark}><Scale aria-hidden="true" size={20} /></span>
      <span className={styles.brandCopy}>
        <strong>{locale === "ar" ? "حسين الحارثي" : "Hussein Al Harthi"}</strong>
        <span>{copy.administration}</span>
      </span>
    </Link>
  );
}

function Identity({ compact = false, locale, user }: { compact?: boolean; locale: Locale; user: AuthUser }) {
  return (
    <span className={compact ? styles.identityCompact : styles.identity}>
      <span aria-hidden="true" className={styles.avatar}>{initials(user.name)}</span>
      <span className={styles.identityText}>
        <strong>{user.name}</strong>
        <span>{roleLabels[user.role][locale]}</span>
      </span>
    </span>
  );
}

function Navigation({ locale, onNavigate, pathname, role, variant }: {
  locale: Locale;
  onNavigate?: () => void;
  pathname: string;
  role: UserRole;
  variant: "desktop" | "mobile";
}) {
  const copy = shellCopy[locale];
  return (
    <nav aria-label={copy.navigation} className={styles.navigation} data-testid={`admin-${variant}-navigation`}>
      {permittedGroups(role).map((group) => (
        <section aria-labelledby={`${variant}-${group.id}-label`} className={styles.navigationGroup} key={group.id}>
          <p id={`${variant}-${group.id}-label`}>{group.label[locale]}</p>
          <div>
            {group.items.map((item) => {
              const active = isActivePath(pathname, locale, item.href);
              const Icon = item.icon;
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={active ? styles.active : undefined}
                  data-nav-id={item.id}
                  href={localizePath(item.href, locale)}
                  key={item.id}
                  onClick={onNavigate}
                >
                  <Icon aria-hidden="true" size={18} />
                  <span>{item.label[locale]}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}

function AccountPanel({ id, locale, logoutError, logoutPending, onLocale, onLogout, user }: {
  id: string;
  locale: Locale;
  logoutError: boolean;
  logoutPending: boolean;
  onLocale: (locale: Locale) => void;
  onLogout: () => void;
  user: AuthUser;
}) {
  const copy = shellCopy[locale];
  return (
    <div className={styles.accountPanel}>
      <div className={styles.accountIdentity}>
        <Identity locale={locale} user={user} />
        <bdi dir="ltr">{user.email}</bdi>
      </div>
      <div aria-labelledby={`${id}-locale-label`} className={styles.localeControl} role="group">
        <p id={`${id}-locale-label`}>{copy.locale}</p>
        <div>
          <button aria-pressed={locale === "ar"} onClick={() => onLocale("ar")} type="button">العربية</button>
          <button aria-pressed={locale === "en"} onClick={() => onLocale("en")} type="button">English</button>
        </div>
      </div>
      <ThemeToggle id={`${id}-theme`} variant="inline" />
      <button className={styles.logoutButton} disabled={logoutPending} onClick={onLogout} type="button">
        <LogOut aria-hidden="true" size={17} />
        <span>{copy.logout}</span>
      </button>
      {logoutError ? <p className={styles.accountError} role="alert">{copy.logoutError}</p> : null}
    </div>
  );
}

function LoginWorkspace({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const copy = shellCopy[locale];
  return (
    <div className={`${styles.workspace} ${styles.loginWorkspace}`} data-admin-root>
      <a className={styles.skipLink} href="#admin-main">{copy.skip}</a>
      <header className={styles.loginHeader} data-admin-shell="true">
        <Brand href={localizePath("/admin", locale)} locale={locale} />
        <span>{copy.secureAdministration}</span>
      </header>
      <main className={styles.loginContent} id="admin-main" tabIndex={-1}>{children}</main>
    </div>
  );
}

function SessionLoading({ locale }: { locale: Locale }) {
  const copy = shellCopy[locale];
  return (
    <div className={styles.workspace} data-admin-root data-testid="admin-session-loading">
      <a className={styles.skipLink} href="#admin-main">{copy.skip}</a>
      <aside className={styles.sidebar}><Brand href={localizePath("/admin", locale)} locale={locale} /></aside>
      <header className={styles.topbar} data-admin-shell="true"><span>{copy.secureAdministration}</span></header>
      <main aria-busy="true" className={styles.content} id="admin-main" tabIndex={-1}>
        <div className={styles.sessionLoading}><span aria-hidden="true" /><p>{copy.loading}</p></div>
      </main>
    </div>
  );
}

function AuthenticatedWorkspace({ children, locale, pathname }: { children: React.ReactNode; locale: Locale; pathname: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = useQuery({ queryKey: ["auth", "me"], queryFn: currentUser, retry: false });
  const copy = shellCopy[locale];

  useEffect(() => {
    if (session.isError) router.replace(localizePath("/admin/login", locale));
  }, [locale, router, session.isError]);

  const signout = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["auth", "me"] });
      setAccountOpen(false);
      setMobileOpen(false);
      router.replace(localizePath("/admin/login", locale));
    },
  });

  const user = session.data?.user;
  const rootPath = localizePath("/admin", locale);
  const redirectingToOperations = Boolean(user && user.role !== "ADMIN" && pathname === rootPath);

  useEffect(() => {
    if (redirectingToOperations && user) router.replace(localizePath(landingPath(user.role), locale));
  }, [locale, redirectingToOperations, router, user]);

  if (!user) return <SessionLoading locale={locale} />;

  const home = localizePath(landingPath(user.role), locale);
  const changeLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    setAccountOpen(false);
    setMobileOpen(false);
    const suffix = `${window.location.search}${window.location.hash}`;
    router.push(`${localizePath(pathname, nextLocale)}${suffix}`);
  };
  const accountProps = {
    locale,
    logoutError: signout.isError,
    logoutPending: signout.isPending,
    onLocale: changeLocale,
    onLogout: () => signout.mutate(),
    user,
  };

  return (
    <div className={styles.workspace} data-admin-root>
      <a className={styles.skipLink} href="#admin-main">{copy.skip}</a>
      <aside className={styles.sidebar} data-testid="admin-sidebar">
        <Brand href={home} locale={locale} />
        <Navigation locale={locale} pathname={pathname} role={user.role} variant="desktop" />
        <div className={styles.sidebarAccount} data-testid="admin-sidebar-identity">
          <Identity locale={locale} user={user} />
          <bdi dir="ltr">{user.email}</bdi>
        </div>
      </aside>

      <header className={styles.topbar} data-admin-shell="true">
        <Dialog onOpenChange={setMobileOpen} open={mobileOpen}>
          <DialogTrigger asChild>
            <button aria-label={copy.openNavigation} className={styles.menuButton} data-testid="admin-mobile-nav-trigger" type="button">
              <Menu aria-hidden="true" size={20} />
            </button>
          </DialogTrigger>
          <AdminDialogContent
            className={styles.mobileSheet}
            closeLabel={copy.close}
            data-admin-mobile-sheet
            data-testid="admin-mobile-sheet"
            overlayClassName={styles.mobileOverlay}
            style={{
              insetInlineEnd: "auto",
              insetInlineStart: 0,
              left: locale === "en" ? 0 : "auto",
              right: locale === "ar" ? 0 : "auto",
              transform: "none",
              translate: "0 0",
            }}
          >
            <DialogTitle>{copy.administration}</DialogTitle>
            <DialogDescription className={styles.visuallyHidden}>{copy.mobileDescription}</DialogDescription>
            <Brand href={home} locale={locale} />
            <Navigation locale={locale} onNavigate={() => setMobileOpen(false)} pathname={pathname} role={user.role} variant="mobile" />
            <AccountPanel id="admin-mobile-account" {...accountProps} />
          </AdminDialogContent>
        </Dialog>

        <div className={styles.mobileBrand}><Brand href={home} locale={locale} /></div>
        <AdminBreadcrumbs items={breadcrumbItems(pathname, locale)} label={copy.breadcrumb} />

        <Dialog onOpenChange={setAccountOpen} open={accountOpen}>
          <DialogTrigger asChild>
            <button aria-label={copy.openAccount} className={styles.accountTrigger} data-testid="admin-account-trigger" type="button">
              <UserRound aria-hidden="true" size={17} />
              <Identity compact locale={locale} user={user} />
            </button>
          </DialogTrigger>
          <AdminDialogContent className={styles.accountDialog} closeLabel={copy.close} overlayClassName={styles.mobileOverlay}>
            <DialogTitle>{copy.account}</DialogTitle>
            <DialogDescription>{copy.accountDescription}</DialogDescription>
            <AccountPanel id="admin-account" {...accountProps} />
          </AdminDialogContent>
        </Dialog>
      </header>

      <main className={styles.content} id="admin-main" tabIndex={-1}>
        {redirectingToOperations ? <div aria-busy="true" className={styles.routeLoading}>{copy.loading}</div> : children}
      </main>
    </div>
  );
}

export function AdminWorkspace({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const pathname = usePathname();
  if (pathname.endsWith("/admin/login")) return <LoginWorkspace locale={locale}>{children}</LoginWorkspace>;
  return <AuthenticatedWorkspace locale={locale} pathname={pathname}>{children}</AuthenticatedWorkspace>;
}
