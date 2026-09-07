import type { Metadata } from "next";
import ContactPage from "../../../contact/page";
import { isLocale } from "@/i18n/locale";
import { localizedMetadata } from "@/i18n/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(isLocale(locale) ? locale : "ar", "/contact", locale === "en" ? "Contact Us" : "تواصل معنا", locale === "en" ? "Contact Hussein Al Harithi for legal support in Abu Dhabi." : "تواصل مع مكتب حسين الحارثي للدعم القانوني في أبوظبي.");
}
export default ContactPage;
