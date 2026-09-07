import type { Metadata } from "next";
import ServicesPage from "../../../services/page";
import { isLocale } from "@/i18n/locale";
import { localizedMetadata } from "@/i18n/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(isLocale(locale) ? locale : "ar", "/services", locale === "en" ? "Legal Services" : "الخدمات القانونية", locale === "en" ? "Legal services for UAE criminal, commercial, civil, notary and tax matters." : "خدمات قانونية متكاملة في القضايا الجنائية والتجارية والمدنية والتوثيق والضرائب.");
}
export default ServicesPage;
