import type { Locale } from "./locale";
import { messages } from "./messages";
import { serviceContent } from "./service-content";

const BUSINESS_TIME_ZONE = "Asia/Dubai";

export function formatLocaleDate(value: string | Date, locale: Locale, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-AE-u-nu-latn" : "en-AE", { timeZone: BUSINESS_TIME_ZONE, year: "numeric", month: "short", day: "numeric", ...options }).format(new Date(value));
}

export function formatLocaleDateTime(value: string | Date, locale: Locale) {
  return formatLocaleDate(value, locale, { hour: "2-digit", minute: "2-digit" });
}

export function formatConsultationDate(value: string, locale: Locale) {
  return formatLocaleDate(value, locale);
}

export function formatConsultationTime(value: string, locale: Locale) {
  if (locale === "en") return value;

  const match = /^(\d{1,2}):(\d{2})\s(AM|PM)$/.exec(value);
  if (!match) return value;

  const [, hours, minutes, period] = match;
  const hour = (Number(hours) % 12) + (period === "PM" ? 12 : 0);
  return new Intl.DateTimeFormat("ar-AE-u-nu-latn", {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(Date.UTC(2000, 0, 1, hour, Number(minutes))));
}

export function formatLocaleNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-AE-u-nu-latn" : "en-AE").format(value);
}

export function displayEnum(locale: Locale, value: string) {
  return (messages[locale].status as Record<string, string>)[value] ?? value;
}

export function localizeServiceTitle(locale: Locale, service: { id?: string; slug?: string; name?: string; title?: string }) {
  const key = service.slug ?? service.id;
  if (key && key in serviceContent.en) return serviceContent[locale][key as keyof typeof serviceContent.en].title;
  return service.title ?? service.name ?? messages[locale].errors.SERVICE_NOT_FOUND;
}

export function localizeService(locale: Locale, service: { id?: string; slug?: string; name?: string; title?: string; description?: string; desc?: string }) {
  const key = service.slug ?? service.id;
  const translation = key && key in serviceContent.en ? serviceContent.en[key as keyof typeof serviceContent.en] : undefined;
  if (translation) return serviceContent[locale][key as keyof typeof serviceContent.en];

  return {
    title: messages[locale].errors.SERVICE_NOT_FOUND,
    description: messages[locale].errors.SERVICE_NOT_FOUND,
  };
}
