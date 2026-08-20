import type { Metadata } from "next";
import HomePage from "../page";
import { isLocale } from "@/i18n/locale";
import { localizedMetadata } from "@/i18n/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : "ar";
  return localizedMetadata(
    locale,
    "/",
    locale === "ar" ? "حسين الحارثي للمحاماة والاستشارات القانونية | أبوظبي" : "Hussein Al Harithi | Legal Services in Abu Dhabi",
    locale === "ar"
      ? "خدمات واستشارات قانونية في أبوظبي، مع مسار واضح لمناقشة المسائل الجنائية والتجارية والمدنية والتوثيق والضرائب."
      : "Legal services and consultations in Abu Dhabi for criminal, commercial, civil, notary, and tax matters, with a clear path to the next conversation.",
  );
}

export default HomePage;
