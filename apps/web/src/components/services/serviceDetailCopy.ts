import type { Locale } from "@/i18n/locale";
import { serviceContent } from "@/i18n/service-content";

type Feature = { title: string; description: string };

export function localizeServiceFeatures(locale: Locale, service: { id: string; features?: Feature[] }) {
  if (locale === "en" && service.id in serviceContent.en) return serviceContent.en[service.id as keyof typeof serviceContent.en].features;
  return service.features ?? [];
}
