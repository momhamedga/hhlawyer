import type { EmailLocale } from "./email.types.js";

export function resolveEmailLocale(acceptLanguage: string | undefined): EmailLocale {
  const language = acceptLanguage?.split(",", 1)[0]?.trim().toLowerCase();
  return language?.startsWith("ar") ? "ar" : "en";
}
