import type { Metadata } from "next";
import AboutPage from "../../about/page";
import { isLocale } from "@/i18n/locale";
import { localizedMetadata } from "@/i18n/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(isLocale(locale) ? locale : "ar", "/about", locale === "en" ? "About the Attorney" : "عن المحامي", locale === "en" ? "Learn about Hussein Al Harithi’s professional legal experience in the UAE." : "تعرّف على الخبرات القانونية والتحصيل الأكاديمي للأستاذ حسين الحارثي.");
}
export default AboutPage;
