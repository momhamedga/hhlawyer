"use client";

import Link from "next/link";
import type { AdminConsultationListItem } from "@hhlawyer/types";
import { ConsultationStatusBadge } from "./ConsultationStatusBadge";
import { useLocale, localizePath } from "@/components/providers/LocaleProvider";
import { formatConsultationTime, formatLocaleDate, formatLocaleDateTime, localizeServiceTitle } from "@/i18n/format";
import { messages } from "@/i18n/messages";

export function ConsultationTable({ items }: { items: AdminConsultationListItem[] }) {
  const locale = useLocale();
  const t = messages[locale].admin.consultation;
  const labels = [t.reference, t.client, t.service, t.requestedDate, messages[locale].common.time, messages[locale].common.status, t.receivedAt, messages[locale].admin.action];
  return <div className="overflow-x-auto rounded-xl border border-white/10" tabIndex={0} aria-label={t.tableLabel}>
    <table className="min-w-[900px] w-full text-start text-sm">
      <caption className="sr-only">{t.tableCaption}</caption>
      <thead className="bg-white/5 text-xs text-gold-light"><tr>{labels.map((label) => <th key={label} scope="col" className="whitespace-nowrap px-4 py-3 font-bold">{label}</th>)}</tr></thead>
      <tbody>{items.map((item) => <tr key={item.id} className="border-t border-white/10 hover:bg-white/5"><td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-gold-light" dir="ltr">{item.referenceNumber}</td><td className="px-4 py-4"><p className="font-bold">{item.name}</p><p className="mt-1 text-xs text-white/55" dir="ltr">{item.email}</p></td><td className="px-4 py-4">{localizeServiceTitle(locale, item.service)}</td><td className="whitespace-nowrap px-4 py-4">{formatLocaleDate(item.preferredDate, locale)}</td><td className="whitespace-nowrap px-4 py-4"><bdi>{formatConsultationTime(item.preferredTime, locale)}</bdi></td><td className="px-4 py-4"><ConsultationStatusBadge status={item.status} /></td><td className="whitespace-nowrap px-4 py-4 text-xs text-white/70">{formatLocaleDateTime(item.createdAt, locale)}</td><td className="px-4 py-4"><Link href={localizePath(`/admin/consultations/${item.id}`, locale)} className="rounded border border-gold/60 px-3 py-2 text-xs font-bold text-gold-light">{t.viewRequest}</Link></td></tr>)}</tbody>
    </table>
  </div>;
}
