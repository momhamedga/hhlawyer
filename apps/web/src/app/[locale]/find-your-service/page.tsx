import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalMatterFinder } from "@/components/legal-matter-finder/LegalMatterFinder";
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
    "/find-your-service",
    locale === "ar" ? "ابدأ من مشكلتك" : "Find the Right Practice Area",
    locale === "ar" ? "توجيه أولي يساعدك على استكشاف مجال الممارسة القانوني الأقرب من خلال اختيارات عامة." : "A short, general guide to help you explore the closest legal practice area to start with.",
  );
}

export default async function FindYourServicePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  return <LegalMatterFinder key={localeParam} locale={localeParam} />;
}
