"use client";

import Link from "next/link";
import { ArrowUpRight, Mail, Menu, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NAV_LINKS } from "@/constants/navigation";
import { messages } from "@/i18n/messages";
import styles from "./Header.module.css";

export function Header() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();
  const t = messages[locale];
  const barePath = pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
  const isAdmin = barePath === "/admin" || barePath.startsWith("/admin/");
  const translated = (en: string, ar: string) => locale === "en" ? en : ar;
  const items = NAV_LINKS.map((item) => ({ href: item.href, label: (t.navigation as Record<string, string>)[item.href] ?? item.label }));
  const active = (href: string) => href === "/" ? barePath === "/" : barePath === href || barePath.startsWith(`${href}/`);
  const consultationHref = `${localizePath("/consultation", locale)}#consultation`;

  if (isAdmin) return <header className={styles.adminHeader} data-admin-shell="true"><Link aria-label={t.brand.name} className={styles.adminBrand} href={localizePath("/admin", locale)}><BrandLogo priority variant="header" /><span>{t.admin.title}</span></Link></header>;

  return <header className={styles.header} data-public-header="true">
    <div className={styles.accentRule} />
    <div className={styles.inner}>
      <Link aria-label={t.brand.name} className={styles.brand} href={localizePath("/", locale)}><BrandLogo priority variant="header" /></Link>
      <nav aria-label={translated("Primary navigation", "التنقل الرئيسي")} className={styles.desktopNav}>{items.map((item) => <Link className={active(item.href) ? styles.active : undefined} href={localizePath(item.href, locale)} key={item.href}>{item.label}</Link>)}</nav>
      <div className={styles.controls}>
        <Link className={styles.cta} href={consultationHref}>{translated("Consultation", "استشارة")}<ArrowUpRight size={16} /></Link>
        <Suspense fallback={<span aria-hidden="true" className={styles.controlFallback} />}><LanguageSwitcher className={styles.language} /></Suspense>
        <ThemeToggle className={styles.theme} id="public-theme" />
        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild><button aria-label={translated("Open menu", "فتح القائمة")} className={styles.menuButton} data-testid="public-mobile-menu-trigger" type="button"><Menu size={21} /></button></DialogTrigger>
          <DialogContent className={styles.mobilePanel} closeLabel={t.common.close} dir={locale === "ar" ? "rtl" : "ltr"} style={{ translate: "none" }}>
            <DialogTitle className="sr-only">{translated("Navigation menu", "قائمة التنقل")}</DialogTitle>
            <div className={styles.mobileBrand}><BrandLogo priority variant="mobile" /></div>
            <nav aria-label={translated("Mobile navigation", "تنقل الهاتف")} className={styles.mobileNav}>{items.map((item, index) => <Link className={active(item.href) ? styles.active : undefined} href={localizePath(item.href, locale)} key={item.href} onNavigate={() => setOpen(false)}><span>0{index + 1}</span>{item.label}<ArrowUpRight size={17} /></Link>)}</nav>
            <Link className={styles.mobileCta} href={consultationHref} onNavigate={() => setOpen(false)}>{translated("Arrange a consultation", "رتّب استشارة")}<ArrowUpRight size={18} /></Link>
            <div className={`${styles.mobileUtilities} !grid !gap-4`}><Suspense fallback={null}><LanguageSwitcher className={styles.language} /></Suspense><ThemeToggle className="w-full" id="mobile-theme" variant="inline" /></div>
            <div className={styles.mobileContact}><a href="tel:+971502001797"><Phone size={16}/><bdi>0502001797</bdi></a><a href="mailto:info@hussein.ae"><Mail size={16}/>info@hussein.ae</a></div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </header>;
}
