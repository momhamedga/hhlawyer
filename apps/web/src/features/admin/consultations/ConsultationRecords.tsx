"use client";

import type { AdminConsultationListItem } from "@hhlawyer/types";
import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { AdminTechnicalValue } from "@/components/admin/foundation";
import { localizePath } from "@/components/providers/LocaleProvider";
import { formatConsultationTime, formatLocaleDate, formatLocaleDateTime, localizeServiceTitle } from "@/i18n/format";
import type { Locale } from "@/i18n/locale";
import { consultationsContent } from "./consultations-content";
import { ConsultationStatusBadge } from "./ConsultationStatusBadge";
import styles from "./Consultations.module.css";

function DetailLink({ id, locale }: { id: string; locale: Locale }) {
  const copy = consultationsContent[locale];
  const Icon = locale === "ar" ? ArrowUpLeft : ArrowUpRight;
  return <Link className={styles.detailLink} href={localizePath(`/admin/consultations/${id}`, locale)}><span>{copy.viewDetails}</span><Icon aria-hidden="true" size={15} /></Link>;
}

function Appointment({ item, locale }: { item: AdminConsultationListItem; locale: Locale }) {
  return <span className={styles.appointment}><strong>{formatLocaleDate(item.preferredDate, locale)}</strong><bdi>{formatConsultationTime(item.preferredTime, locale)}</bdi></span>;
}

export function ConsultationRecords({ items, locale }: { items: AdminConsultationListItem[]; locale: Locale }) {
  const copy = consultationsContent[locale];
  return <>
    <div className={styles.desktopTable} data-testid="consultations-desktop-table"><table><caption className={styles.srOnly}>{copy.listCaption}</caption><thead><tr><th scope="col">{copy.reference}</th><th scope="col">{copy.client}</th><th scope="col">{copy.service}</th><th scope="col">{copy.requestedAppointment}</th><th scope="col">{copy.status}</th><th scope="col">{copy.received}</th><th scope="col"><span className={styles.srOnly}>{copy.viewDetails}</span></th></tr></thead><tbody>{items.map((item) => <tr className={item.status === "PENDING" ? styles.pendingRow : undefined} key={item.id}><td><div className={styles.referenceCell}><AdminTechnicalValue>{item.referenceNumber}</AdminTechnicalValue>{item.status === "PENDING" ? <span className={styles.attentionLabel}>{copy.pendingAttention}</span> : null}</div></td><td><span className={styles.clientCell}><strong>{item.name}</strong><bdi dir="ltr">{item.email}</bdi></span></td><td>{localizeServiceTitle(locale, item.service)}</td><td><Appointment item={item} locale={locale} /></td><td><ConsultationStatusBadge status={item.status} /></td><td className={styles.receivedCell}>{formatLocaleDateTime(item.createdAt, locale)}</td><td><DetailLink id={item.id} locale={locale} /></td></tr>)}</tbody></table></div>
    <ul aria-label={copy.listCaption} className={styles.mobileRecords} data-testid="consultations-mobile-list">{items.map((item) => <li key={item.id}><article className={item.status === "PENDING" ? styles.pendingCard : undefined}><div className={styles.cardHeading}><div><AdminTechnicalValue>{item.referenceNumber}</AdminTechnicalValue>{item.status === "PENDING" ? <span className={styles.attentionLabel}>{copy.pendingAttention}</span> : null}</div><ConsultationStatusBadge status={item.status} /></div><div className={styles.cardBody}><div><span>{copy.client}</span><strong>{item.name}</strong></div><div><span>{copy.service}</span><strong>{localizeServiceTitle(locale, item.service)}</strong></div><div><span>{copy.requestedAppointment}</span><Appointment item={item} locale={locale} /></div><div><span>{copy.received}</span><strong>{formatLocaleDateTime(item.createdAt, locale)}</strong></div></div><DetailLink id={item.id} locale={locale} /></article></li>)}</ul>
  </>;
}
