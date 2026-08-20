export const SUPPORTED_LOCALES = ["ar", "en"] as const;
export const DEFAULT_LOCALE = "ar";

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export const localeAttributes: Record<Locale, { dir: "rtl" | "ltr"; fontClass: string; label: string }> = {
  ar: { dir: "rtl", fontClass: "font-arabic", label: "العربية" },
  en: { dir: "ltr", fontClass: "font-english", label: "English" },
};
