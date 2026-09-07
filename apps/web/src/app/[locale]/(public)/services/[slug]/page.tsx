import type { Metadata } from "next";
import ServiceDetails from "../../../../services/[slug]/page";
import { LAW_SERVICES } from "@/constants/Services";
import { localizeService } from "@/i18n/format";
import { isLocale } from "@/i18n/locale";
import { localizedMetadata } from "@/i18n/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = isLocale(localeParam) ? localeParam : "ar";
  const service = LAW_SERVICES.find((item) => item.id === slug);
  if (!service) return {};
  const copy = localizeService(locale, service);
  return localizedMetadata(locale, `/services/${service.id}`, copy.title, copy.description);
}

export default ServiceDetails;
