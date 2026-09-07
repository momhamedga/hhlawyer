import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalGuideDetail } from "@/components/legal-guides/LegalGuideDetail";
import { guideSlugs, isGuideSlug, legalGuidesContent } from "@/i18n/legal-guides-content";
import { isLocale, SUPPORTED_LOCALES } from "@/i18n/locale";
import { localizedMetadata } from "@/i18n/seo";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((locale) => guideSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = isLocale(localeParam) ? localeParam : "ar";
  if (!isGuideSlug(slug)) return {};
  const guide = legalGuidesContent[locale].guides[slug];
  return localizedMetadata(locale, `/guides/${slug}`, guide.title, guide.description);
}

export default async function GuideDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam) || !isGuideSlug(slug)) notFound();
  return <LegalGuideDetail locale={localeParam} slug={slug} />;
}
