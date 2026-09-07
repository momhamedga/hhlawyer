import type { Metadata } from "next";
import ConsultationPage from "../../../consultation/page";
import { isLocale } from "@/i18n/locale";
import { localizedMetadata } from "@/i18n/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(isLocale(locale) ? locale : "ar", "/consultation", locale === "en" ? "Request a Consultation" : "اطلب استشارة", locale === "en" ? "Request a private legal consultation with Hussein Al Harithi." : "اطلب استشارة قانونية خاصة مع حسين الحارثي.");
}
export default ConsultationPage;
