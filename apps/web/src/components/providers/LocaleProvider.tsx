"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";

import { DEFAULT_LOCALE, isLocale, localeAttributes, type Locale } from "@/i18n/locale";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

function localeFromPathname(pathname: string): Locale {
  const segment = pathname.split("/")[1] ?? "";
  return isLocale(segment) ? segment : DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = useMemo(() => localeFromPathname(pathname), [pathname]);

  useEffect(() => {
    const { dir, fontClass } = localeAttributes[locale];
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dir;
    root.classList.toggle("font-arabic", fontClass === "font-arabic");
    root.classList.toggle("font-english", fontClass === "font-english");
    document.cookie = `hhlawyer-locale=${locale}; Path=/; SameSite=Lax`;
  }, [locale]);

  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function localizePath(pathname: string, locale: Locale) {
  const suffix = pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
  return `/${locale}${suffix === "/" ? "" : suffix}`;
}
