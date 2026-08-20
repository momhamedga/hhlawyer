import type { Metadata } from "next";
import type { Locale } from "./locale";

const SITE_NAME = "Hussein Al Harithi";

export function localizedMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  const canonical = `/${locale}${path === "/" ? "" : path}`;
  const alternatePath = `${locale === "ar" ? "/en" : "/ar"}${path === "/" ? "" : path}`;
  return {
    title,
    description,
    alternates: { canonical, languages: { ar: locale === "ar" ? canonical : alternatePath, en: locale === "en" ? canonical : alternatePath } },
    openGraph: { title: `${title} | ${SITE_NAME}`, description, url: canonical, siteName: SITE_NAME, locale: locale === "ar" ? "ar_AE" : "en_AE", alternateLocale: locale === "ar" ? "en_AE" : "ar_AE", type: "website" },
  };
}
