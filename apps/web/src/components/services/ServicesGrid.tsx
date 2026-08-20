"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LAW_SERVICES } from "@/constants/Services";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { localizeService } from "@/i18n/format";

export function ServicesGrid() { const locale = useLocale(); return <section aria-label={locale === "ar" ? "الخدمات القانونية" : "Legal services"} className="border-t border-border">{LAW_SERVICES.map((service,index) => { const copy=localizeService(locale,service); const Icon=service.icon; return <Link key={service.id} href={localizePath(`/services/${service.id}`,locale)} className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b border-border py-6 transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="text-xs font-bold text-primary">{String(index+1).padStart(2,"0")}</span><span><span className="flex items-center gap-3 text-xl font-bold text-card-foreground"><Icon aria-hidden="true" className="size-5 text-primary" strokeWidth={1.75}/>{copy.title}</span><span className="mt-2 block max-w-2xl text-sm leading-6 text-muted-foreground">{copy.description}</span></span><ArrowLeft aria-hidden="true" className="size-5 text-primary transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1"/></Link>; })}</section>; }
