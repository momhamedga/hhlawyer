"use client";

import { Clock3, Mail, MessageSquareText, UserRound } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminPage, AdminPageHeader, AdminSectionTitle, AdminSurface, AdminTechnicalValue } from "@/components/admin/foundation";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { formatLocaleDateTime } from "@/i18n/format";
import { adminContactsKeys, getAdminContact } from "@/lib/api/admin-contacts";
import { currentUser } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { MessageActions } from "./MessageActions";
import { MessageStatusBadge } from "./MessageStatusBadge";
import { MessageDetailSkeleton, MessagesError } from "./MessagesStates";
import { messagesContent } from "./messages-content";
import { canManageMessages } from "./messages-model";
import styles from "./Messages.module.css";

function Definition({ label, technical = false, value }: { label: string; technical?: boolean; value: React.ReactNode }) {
  return <div><dt>{label}</dt><dd>{technical ? <AdminTechnicalValue>{value}</AdminTechnicalValue> : value}</dd></div>;
}

export function MessageDetailPage() {
  const locale = useLocale();
  const copy = messagesContent[locale];
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const user = useQuery({ queryKey: ["auth", "me"], queryFn: currentUser, retry: false });
  const message = useQuery({ enabled: Boolean(user.data && id), queryKey: adminContactsKeys.detail(id), queryFn: ({ signal }) => getAdminContact(id, signal), retry: 1 });
  useEffect(() => { if (user.isError || (user.isSuccess && !user.data)) router.replace(localizePath("/admin/login", locale)); }, [locale, router, user.data, user.isError, user.isSuccess]);

  if (user.isLoading || message.isLoading) return <MessageDetailSkeleton locale={locale} />;
  if (!user.data) return null;
  const errorCode = message.error instanceof ApiClientError ? message.error.error.code : "";
  if (message.isError) return <AdminPage className={styles.page}><MessagesError forbidden={errorCode === "FORBIDDEN"} locale={locale} notFound={errorCode === "CONTACT_MESSAGE_NOT_FOUND"} onRetry={() => void message.refetch()} /><Link className={styles.backLink} href={localizePath("/admin/contacts", locale)}>{copy.backToList}</Link></AdminPage>;
  const item = message.data;
  if (!item) return null;

  return <AdminPage className={styles.page} data-testid="admin-message-detail">
    <AdminPageHeader actions={<span data-status={item.status} data-testid="contact-status"><MessageStatusBadge status={item.status} /></span>} className={styles.detailHeader} description={`${copy.received}: ${formatLocaleDateTime(item.createdAt, locale)}`} title={item.subject} />
    <div className={styles.detailGrid}>
      <AdminSurface className={styles.senderSurface}><div className={styles.sectionHeading}><span className={styles.sectionIcon}><UserRound aria-hidden="true" size={19} /></span><AdminSectionTitle>{copy.senderTitle}</AdminSectionTitle></div><dl className={styles.definitionList}><Definition label={copy.name} value={item.name} /><Definition label={copy.email} value={<AdminTechnicalValue>{item.email}</AdminTechnicalValue>} /></dl><a aria-label={copy.openEmailClientFor(item.name)} className={styles.emailLink} href={`mailto:${item.email}`}><Mail aria-hidden="true" size={16} />{copy.openEmailClient}</a></AdminSurface>
      <AdminSurface className={styles.messageSurface}><div className={styles.sectionHeading}><span className={styles.sectionIcon}><MessageSquareText aria-hidden="true" size={19} /></span><AdminSectionTitle>{copy.messageTitle}</AdminSectionTitle></div><p data-testid="contact-message-body" dir="auto">{item.message}</p></AdminSurface>
      <AdminSurface className={styles.workflowSurface}><AdminSectionTitle>{copy.workflowTitle}</AdminSectionTitle><p>{copy.workflowDescription}</p><MessageActions canManage={canManageMessages(user.data.user.role)} id={item.id} status={item.status} subject={item.subject} /></AdminSurface>
      <AdminSurface className={styles.metadataSurface}><div className={styles.sectionHeading}><span className={styles.sectionIcon}><Clock3 aria-hidden="true" size={19} /></span><AdminSectionTitle>{copy.metadataTitle}</AdminSectionTitle></div><dl className={styles.definitionList}><Definition label={copy.received} value={formatLocaleDateTime(item.createdAt, locale)} /><Definition label={copy.updated} value={formatLocaleDateTime(item.updatedAt, locale)} /></dl></AdminSurface>
    </div>
  </AdminPage>;
}
