import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, isLocale, SUPPORTED_LOCALES } from "@/i18n/locale";

function localeFromReferer(request: NextRequest) {
  const referer = request.headers.get("referer");
  if (!referer) return undefined;
  try {
    const segment = new URL(referer).pathname.split("/")[1];
    return SUPPORTED_LOCALES.includes(segment as (typeof SUPPORTED_LOCALES)[number]) ? segment : undefined;
  } catch {
    return undefined;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathLocale = pathname.split("/")[1] ?? "";
  if (isLocale(pathLocale)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-hhlawyer-locale", pathLocale);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const locale = request.cookies.get("hhlawyer-locale")?.value ?? localeFromReferer(request) ?? DEFAULT_LOCALE;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|icon.svg|robots.txt|sitemap.xml|.*\\..*).*)"],
};
