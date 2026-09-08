"use client";

import type { AdminContactListItem } from "@hhlawyer/types";
import { ArrowUpLeft, ArrowUpRight, Mail } from "lucide-react";
import Link from "next/link";
import { localizePath } from "@/components/providers/LocaleProvider";
import { formatLocaleDateTime } from "@/i18n/format";
import type { Locale } from "@/i18n/locale";
import { messagesContent } from "./messages-content";
import { MessageStatusBadge } from "./MessageStatusBadge";
import styles from "./Messages.module.css";

function MessageLink({ id, locale, subject }: { id: string; locale: Locale; subject: string }) {
  const copy = messagesContent[locale];
  const Icon = locale === "ar" ? ArrowUpLeft : ArrowUpRight;
  return <Link aria-label={copy.openMessage(subject)} className={styles.detailLink} data-testid="contact-view" href={localizePath(`/admin/contacts/${id}`, locale)}><span>{copy.viewMessage}</span><Icon aria-hidden="true" size={15} /></Link>;
}
export function MessageRecords({ items, locale }: { items: AdminContactListItem[]; locale: Locale }) {
  const copy = messagesContent[locale];
  return <>
    <div className={styles.desktopInbox} data-testid="messages-desktop-list"><table><caption className={styles.srOnly}>{copy.listCaption}</caption><thead><tr><th scope="col"><span className={styles.srOnly}>{copy.status}</span></th><th scope="col">{copy.sender}</th><th scope="col">{copy.subject}</th><th scope="col">{copy.received}</th><th scope="col">{copy.status}</th><th scope="col"><span className={styles.srOnly}>{copy.viewMessage}</span></th></tr></thead><tbody>{items.map((item) => <tr className={item.status === "UNREAD" ? styles.unreadRow : undefined} data-contact-id={item.id} key={item.id}><td><span aria-hidden="true" className={item.status === "UNREAD" ? styles.unreadMarker : styles.readMarker}><Mail size={15} /></span></td><td><span className={styles.senderCell}><strong>{item.name}</strong><bdi dir="ltr">{item.email}</bdi>{item.status === "UNREAD" ? <span className={styles.unreadLabel}>{copy.unreadAttention}</span> : null}</span></td><td><span className={styles.subjectText} title={item.subject}>{item.subject}</span></td><td className={styles.receivedCell}>{formatLocaleDateTime(item.createdAt, locale)}</td><td><MessageStatusBadge status={item.status} /></td><td><MessageLink id={item.id} locale={locale} subject={item.subject} /></td></tr>)}</tbody></table></div>
    <ul aria-label={copy.listCaption} className={styles.mobileMessages} data-testid="messages-mobile-list">{items.map((item) => <li key={item.id}><article className={item.status === "UNREAD" ? styles.unreadCard : undefined} data-contact-id={item.id}><div className={styles.cardHeading}><div className={styles.cardSender}><strong>{item.name}</strong>{item.status === "UNREAD" ? <span className={styles.unreadLabel}>{copy.unreadAttention}</span> : null}</div><MessageStatusBadge status={item.status} /></div><p className={styles.cardSubject}>{item.subject}</p><p className={styles.cardReceived}>{copy.received}: {formatLocaleDateTime(item.createdAt, locale)}</p><MessageLink id={item.id} locale={locale} subject={item.subject} /></article></li>)}</ul>
  </>;
}
