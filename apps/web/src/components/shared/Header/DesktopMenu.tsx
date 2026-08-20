"use client";

import Link from "next/link";

import { NAV_LINKS } from "@/constants/navigation";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { messages } from "@/i18n/messages";

export function DesktopMenu() {
  const locale = useLocale();
  return (
    <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-1 rounded-ds-md border border-border bg-card p-1 shadow-elevation-sm lg:flex">
      {NAV_LINKS.map((link) => (
        <Link
          className="rounded-ds-sm px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={localizePath(link.href, locale)}
          key={link.href}
        >
          {(messages[locale].navigation as Record<string, string>)[link.href] ?? link.label}
        </Link>
      ))}
    </nav>
  );
}
