"use client";

import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { messages } from "@/i18n/messages";
import styles from "./Footer.module.css";

export function Footer() {
  const locale = useLocale();
  const t = messages[locale];
  const go = (path: string) => localizePath(path, locale);
  const text = (en: string, ar: string) => locale === "en" ? en : ar;

  return <footer className={styles.footer}>
    <section className={styles.closing} data-testid="homepage-final-cta">
      <div><p>{text("A considered next step", "خطوة تالية مدروسة")}</p><h2>{t.public.home.ctaTitle}</h2><span>{t.public.home.ctaDescription}</span></div>
      <Link href={`${go("/consultation")}#consultation`}>{t.public.home.ctaPrimary}<ArrowUpRight size={19} /></Link>
    </section>
    <section className={styles.signature}>
      <div className={styles.logoField}><BrandLogo variant="footer" /><span aria-hidden="true" /></div>
      <address className={styles.contactField}>
        <a href="tel:+971502001797"><Phone size={18} /><span><small>{text("Phone", "الهاتف")}</small><bdi>0502001797</bdi></span></a>
        <a href="mailto:info@hussein.ae"><Mail size={18} /><span><small>{text("Email", "البريد الإلكتروني")}</small><bdi>info@hussein.ae</bdi></span></a>
        <p><MapPin size={18} /><span><small>{text("Location", "الموقع")}</small>{t.public.footer.location}</span></p>
      </address>
    </section>
    <section className={styles.footerBase}>
      <nav aria-label={text("Footer navigation", "تنقل التذييل")}><Link href={go("/about")}>{t.public.footer.about}</Link><Link href={go("/services")}>{t.public.footer.services}</Link><Link href={go("/guides")}>{text("Guides", "الأدلة")}</Link><Link href={go("/consultation")}>{text("Consultation", "استشارة")}</Link><Link href={go("/contact")}>{t.public.footer.contact}</Link></nav>
      <small>© {new Date().getFullYear()} {t.brand.name}. {t.public.footer.rights}</small>
    </section>
  </footer>;
}
