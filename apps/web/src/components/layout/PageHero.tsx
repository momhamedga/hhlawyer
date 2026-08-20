"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { PageHeroProps } from "@/types/Layout";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { messages } from "@/i18n/messages";

export function PageHero({ title, subtitle, breadcrumb }: PageHeroProps) {
  const locale = useLocale(); const t = messages[locale];
  return <section className="border-b border-border bg-secondary/30"><div className="mx-auto max-w-[80rem] px-5 pb-14 pt-28 sm:px-8 md:pb-18 md:pt-36"><p className="text-xs font-extrabold tracking-[0.14em] text-primary uppercase">{locale === "en" ? "H/LAW · Legal practice" : "H/LAW · ممارسة قانونية"}</p><nav aria-label={locale === "ar" ? "مسار التنقل" : "Breadcrumb"} className="mt-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><Link className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={localizePath("/", locale)}>{t.common.home}</Link>{breadcrumb.map((item, index) => <span key={`${item.label}-${index}`} className="flex items-center gap-2"><ChevronLeft aria-hidden="true" className="size-4 rtl:rotate-180" />{item.href ? <Link className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={localizePath(item.href, locale)}>{item.label}</Link> : <span className="font-bold text-foreground">{item.label}</span>}</span>)}</nav><div className="mt-7 max-w-3xl border-s-2 border-primary ps-6"><h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">{title}</h1>{subtitle ? <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">{subtitle}</p> : null}</div></div></section>;
}
