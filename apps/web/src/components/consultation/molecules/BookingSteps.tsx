"use client";

import { motion } from "framer-motion";
import type { PublicService } from "@hhlawyer/types";
import { Button } from "@/components/ui";
import { localizeService } from "@/i18n/format";
import { useLocale } from "@/components/providers/LocaleProvider";

export function ServiceStep({ services, selected, onSelect }: { services: PublicService[]; selected?: string; onSelect: (service: PublicService) => void }) {
  const locale = useLocale();
  return <motion.section data-testid="consultation-step-service" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5"><header className="text-center"><p className="text-sm font-extrabold text-primary">01. {locale === "en" ? "Practice area" : "نوع التخصص"}</p><p className="mt-2 text-sm text-muted-foreground">{locale === "en" ? "Choose the legal service you need" : "اختر مجال الخبرة القانونية المطلوب"}</p></header><div className="grid gap-3">{services.map((service) => <button key={service.id} type="button" onClick={() => onSelect(service)} className={`min-h-16 rounded-ds-md border p-4 text-start text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected === service.id ? "border-primary bg-secondary text-primary" : "border-border bg-card text-card-foreground hover:bg-secondary"}`}>{localizeService(locale, service).title}</button>)}</div></motion.section>;
}

function dateForDisplay(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function DateStep({ days, selected, onSelect, onNext }: { days: string[]; selected?: string; onSelect: (date: string) => void; onNext: () => void }) {
  const locale = useLocale();
  const dateLocale = locale === "en" ? "en-AE" : "ar-AE-u-nu-latn";
  const weekday = new Intl.DateTimeFormat(dateLocale, { weekday: "long", timeZone: "UTC" });
  const dayOfMonth = new Intl.DateTimeFormat(dateLocale, { day: "numeric", timeZone: "UTC" });
  return <motion.section data-testid="consultation-step-date" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5"><header className="text-center"><p className="text-sm font-extrabold text-primary">02. {locale === "en" ? "Date" : "اليوم"}</p><p className="mt-2 text-sm text-muted-foreground">{locale === "en" ? "Choose a time that works for your schedule" : "اختر الموعد المناسب لجدولك"}</p></header><div className="grid max-h-96 gap-2 overflow-y-auto pe-1">{days.map((value) => { const date = dateForDisplay(value); const selectedDate = selected === value; return <button key={value} type="button" aria-label={value} onClick={() => onSelect(value)} className={`flex min-h-14 items-center justify-between rounded-ds-md border px-4 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selectedDate ? "border-primary bg-secondary text-primary" : "border-border bg-card text-card-foreground hover:bg-secondary"}`}><span className="text-sm font-bold">{weekday.format(date)}</span><span className="text-lg font-extrabold">{dayOfMonth.format(date)}</span></button>; })}</div><Button className="w-full" disabled={!selected} onClick={onNext} size="lg">{locale === "en" ? "Continue to time" : "المتابعة للوقت"}</Button></motion.section>;
}
