import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, isLocale, SUPPORTED_LOCALES } from "@/i18n/locale";

const railwayApiOrigin = "https://hhlawyerapi-production-3634.up.railway.app";
const nextThemesTransitionStyleHash = "'sha256-nzTgYzXYDNe6BAHiiI7NNlfK8n/auuOAhh2t92YvuXo='";

function createContentSecurityPolicy(nonce: string, hostname: string) {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}' ${nextThemesTransitionStyleHash}`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    `connect-src 'self' ${railwayApiOrigin}${isDevelopment ? " http://localhost:4000" : ""}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(isDevelopment || isLocalhost ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

function setContentSecurityPolicy(response: NextResponse, contentSecurityPolicy: string) {
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  return response;
}

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
  const nonce = btoa(crypto.randomUUID());
  const contentSecurityPolicy = createContentSecurityPolicy(nonce, request.nextUrl.hostname);
  const { pathname } = request.nextUrl;
  const pathLocale = pathname.split("/")[1] ?? "";
  if (isLocale(pathLocale)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-hhlawyer-locale", pathLocale);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);
    return setContentSecurityPolicy(NextResponse.next({ request: { headers: requestHeaders } }), contentSecurityPolicy);
  }

  const locale = request.cookies.get("hhlawyer-locale")?.value ?? localeFromReferer(request) ?? DEFAULT_LOCALE;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return setContentSecurityPolicy(NextResponse.redirect(url), contentSecurityPolicy);
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|icon.svg|robots.txt|sitemap.xml|.*\\..*).*)"],
};
