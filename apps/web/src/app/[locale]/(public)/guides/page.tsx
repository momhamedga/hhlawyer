import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalGuidesIndex } from "@/components/legal-guides/LegalGuidesIndex";
import { isLocale, SUPPORTED_LOCALES } from "@/i18n/locale";
import { localizedMetadata } from "@/i18n/seo";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : "ar";
  return localizedMetadata(
    locale,
    "/guides",
    locale === "ar" ? "الأدلة القانونية" : "Legal Guides",
    locale === "ar" ? "أدلة قانونية موجزة تساعد على فهم المسائل العامة وترتيب الأسئلة قبل الخطوة التالية." : "Brief legal guides to help organise general questions and understand what may be useful before the next conversation.",
  );
}

export default async function GuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  return <LegalGuidesIndex locale={localeParam} />;
}
