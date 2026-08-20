import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale, SUPPORTED_LOCALES } from "@/i18n/locale";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const english = locale === "en";
  return {
    title: english ? "Hussein Al Harithi | Legal Services" : "حسين الحارثي | محاماة واستشارات قانونية",
    description: english ? "Professional legal services and consultations in Abu Dhabi." : "خدمات قانونية واستشارات مهنية في أبوظبي.",
    alternates: { canonical: `/${locale}`, languages: { ar: "/ar", en: "/en" } },
    openGraph: { locale: english ? "en_US" : "ar_AE", alternateLocale: english ? "ar_AE" : "en_US", url: `/${locale}` },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  if (!isLocale((await params).locale)) notFound();
  return children;
}
