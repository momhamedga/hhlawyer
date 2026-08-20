"use client";

import { Languages } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import type { Locale } from "@/i18n/locale";

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const target: Locale = locale === "ar" ? "en" : "ar";
  const query = searchParams.toString();
  const href = `${localizePath(pathname, target)}${query ? `?${query}` : ""}`;

  return <a aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"} className={className} href={href} lang={target}><Languages aria-hidden="true" className="size-4" /><span>{target === "ar" ? "عربي" : "EN"}</span></a>;
}
