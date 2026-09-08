"use client";

import { CalendarDays, Clock3, Mail, Phone, Scale, UserRound } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminPage, AdminPageHeader, AdminSectionTitle, AdminSurface, AdminTechnicalValue } from "@/components/admin/foundation";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { formatConsultationTime, formatLocaleDate, formatLocaleDateTime, localizeServiceTitle } from "@/i18n/format";
import { adminConsultationsKeys, getAdminConsultation } from "@/lib/api/admin-consultations";
import { currentUser } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { ConsultationActions } from "./ConsultationActions";
import { consultationsContent } from "./consultations-content";
import { canManageConsultations } from "./consultations-model";
import { ConsultationStatusBadge } from "./ConsultationStatusBadge";
import { ConsultationDetailSkeleton, ConsultationError } from "./ConsultationStates";
import styles from "./Consultations.module.css";

function Definition({ label, technical = false, value }: { label: string; technical?: boolean; value: React.ReactNode }) {
  return <div><dt>{label}</dt><dd>{technical ? <AdminTechnicalValue>{value}</AdminTechnicalValue> : value}</dd></div>;
}

export function ConsultationDetailPage() {
  const locale = useLocale();
  const copy = consultationsContent[locale];
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const user = useQuery({ queryKey: ["auth", "me"], queryFn: currentUser, retry: false });
  const consultation = useQuery({ enabled: Boolean(user.data && id), queryKey: adminConsultationsKeys.detail(id), queryFn: ({ signal }) => getAdminConsultation(id, signal), retry: 1 });
  useEffect(() => { if (user.isError || (user.isSuccess && !user.data)) router.replace(localizePath("/admin/login", locale)); }, [locale, router, user.data, user.isError, user.isSuccess]);
  if (user.isLoading || consultation.isLoading) return <ConsultationDetailSkeleton locale={locale} />;
  if (!user.data) return null;
  const errorCode = consultation.error instanceof ApiClientError ? consultation.error.error.code : "";
  if (consultation.isError) return <AdminPage className={styles.page}><ConsultationError forbidden={errorCode === "FORBIDDEN"} locale={locale} notFound={errorCode === "CONSULTATION_NOT_FOUND"} onRetry={() => void consultation.refetch()} /><Link className={styles.backLink} href={localizePath("/admin/consultations", locale)}>{copy.backToList}</Link></AdminPage>;
  const item = consultation.data;
  if (!item) return null;
  return <AdminPage className={styles.page} data-testid="admin-consultation-detail">
    <AdminPageHeader actions={<ConsultationStatusBadge status={item.status} />} description={copy.detailDescription} title={copy.detailTitle} />
    <div className={styles.referenceBand}><span>{copy.reference}</span><AdminTechnicalValue>{item.referenceNumber}</AdminTechnicalValue></div>
    <div className={styles.detailGrid}>
      <aside className={styles.workflowColumn}>
        <AdminSurface className={styles.workflowSurface}><AdminSectionTitle>{copy.workflowTitle}</AdminSectionTitle><p>{copy.workflowDescription}</p><ConsultationActions canManage={canManageConsultations(user.data.user.role)} id={item.id} reference={item.referenceNumber} status={item.status} /></AdminSurface>
        <AdminSurface><AdminSectionTitle>{copy.metadataTitle}</AdminSectionTitle><dl className={styles.metadataList}><Definition label={copy.createdAt} value={formatLocaleDateTime(item.createdAt, locale)} /><Definition label={copy.updatedAt} value={formatLocaleDateTime(item.updatedAt, locale)} /></dl></AdminSurface>
      </aside>
      <div className={styles.detailMain}>
        <AdminSurface className={styles.appointmentSurface}><div className={styles.sectionHeading}><span className={styles.sectionIcon}><CalendarDays aria-hidden="true" size={19} /></span><AdminSectionTitle>{copy.appointmentTitle}</AdminSectionTitle></div><dl className={styles.appointmentGrid}><Definition label={copy.requestedDate} value={formatLocaleDate(item.preferredDate, locale)} /><Definition label={copy.requestedTime} value={<span className={styles.inlineValue}><Clock3 aria-hidden="true" size={16} /><bdi>{formatConsultationTime(item.preferredTime, locale)}</bdi></span>} /></dl></AdminSurface>
        <div className={styles.informationGrid}>
          <AdminSurface><div className={styles.sectionHeading}><span className={styles.sectionIcon}><UserRound aria-hidden="true" size={19} /></span><AdminSectionTitle>{copy.clientTitle}</AdminSectionTitle></div><dl className={styles.definitionList}><Definition label={copy.name} value={item.name} /><Definition label={copy.email} value={<a aria-label={copy.emailClient(item.name)} className={styles.contactLink} href={`mailto:${item.email}`}><Mail aria-hidden="true" size={15} /><bdi dir="ltr">{item.email}</bdi></a>} /><Definition label={copy.phone} value={<a aria-label={copy.callClient(item.name)} className={styles.contactLink} href={`tel:${item.phone}`}><Phone aria-hidden="true" size={15} /><bdi dir="ltr">{item.phone}</bdi></a>} /></dl></AdminSurface>
          <AdminSurface><div className={styles.sectionHeading}><span className={styles.sectionIcon}><Scale aria-hidden="true" size={19} /></span><AdminSectionTitle>{copy.serviceTitle}</AdminSectionTitle></div><p className={styles.serviceName}>{localizeServiceTitle(locale, item.service)}</p><AdminTechnicalValue className={styles.serviceSlug}>{item.service.slug}</AdminTechnicalValue></AdminSurface>
        </div>
        <AdminSurface className={styles.messageSurface}><AdminSectionTitle>{copy.clientMessageTitle}</AdminSectionTitle><p data-testid="consultation-client-message">{item.message || copy.noMessage}</p></AdminSurface>
      </div>
    </div>
  </AdminPage>;
}
