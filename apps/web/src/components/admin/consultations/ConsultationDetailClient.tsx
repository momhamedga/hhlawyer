"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { canManageConsultations } from "@/lib/admin-consultations";
import { getAdminConsultation, adminConsultationsKeys } from "@/lib/api/admin-consultations";
import { currentUser } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { ConsultationStatusActions } from "./ConsultationStatusActions";
import { ConsultationStatusBadge } from "./ConsultationStatusBadge";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { formatConsultationTime, formatLocaleDate, formatLocaleDateTime, localizeServiceTitle } from "@/i18n/format";
import { messages } from "@/i18n/messages";

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="glass-card rounded-xl p-5"><h2 className="text-lg font-bold text-gold-light">{title}</h2><div className="mt-4">{children}</div></section>; }

export function ConsultationDetailClient() {
  const router = useRouter(); const locale = useLocale(); const t = messages[locale].admin.consultation;
  const params = useParams<{ id: string }>(); const id = params.id;
  const user = useQuery({ queryKey: ["auth", "me"], queryFn: currentUser, retry: false });
  const consultation = useQuery({ queryKey: adminConsultationsKeys.detail(id), queryFn: ({ signal }) => getAdminConsultation(id, signal), enabled: !!user.data && !!id });
  useEffect(() => { if (user.isError || (user.isSuccess && !user.data)) router.replace(localizePath("/admin/login", locale)); }, [locale, router, user.data, user.isError, user.isSuccess]);
  if (user.isLoading || consultation.isLoading) return <DetailSkeleton />;
  if (!user.data) return null;
  const errorCode = consultation.error instanceof ApiClientError ? consultation.error.error.code : "";
  if (consultation.isError) return <section className="mx-auto max-w-4xl p-8"><div role="alert" className="rounded border border-rose-300/40 bg-rose-950/30 p-6"><p>{errorCode === "CONSULTATION_NOT_FOUND" ? t.notFound : errorCode === "FORBIDDEN" ? t.detailForbidden : t.detailLoadError}</p><Link href={localizePath("/admin/consultations", locale)} className="mt-4 inline-block text-gold-light underline">{t.backToConsultations}</Link></div></section>;
  if (!consultation.data) return null;
  const item = consultation.data;
  return <section className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-8"><nav aria-label={t.breadcrumbs} className="text-sm text-white/60"><Link href={localizePath("/admin", locale)} className="hover:text-gold-light">{messages[locale].admin.dashboard}</Link><span aria-hidden="true"> / </span><Link href={localizePath("/admin/consultations", locale)} className="hover:text-gold-light">{messages[locale].admin.consultations}</Link><span aria-hidden="true"> / </span><span dir="ltr">{item.referenceNumber}</span></nav><header className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-mono text-sm text-gold-light" dir="ltr">{item.referenceNumber}</p><h1 className="mt-2 text-3xl font-extrabold">{t.requestDetails}</h1></div><ConsultationStatusBadge status={item.status} /></header><div className="grid gap-5 md:grid-cols-2"><Section title={t.requestDetails}><dl className="space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-white/60">{t.reference}</dt><dd className="font-mono" dir="ltr">{item.referenceNumber}</dd></div><div className="flex justify-between gap-4"><dt className="text-white/60">{t.receivedDate}</dt><dd>{formatLocaleDateTime(item.createdAt, locale)}</dd></div><div className="flex justify-between gap-4"><dt className="text-white/60">{t.updatedAt}</dt><dd>{formatLocaleDateTime(item.updatedAt, locale)}</dd></div></dl></Section><Section title={t.clientDetails}><dl className="space-y-3 text-sm"><div><dt className="text-white/60">{messages[locale].admin.name}</dt><dd className="mt-1 font-bold">{item.name}</dd></div><div><dt className="text-white/60">{messages[locale].admin.email}</dt><dd className="mt-1"><a href={`mailto:${item.email}`} dir="ltr" aria-label={t.sendEmail.replace("{name}", item.name)} className="text-gold-light underline">{item.email}</a></dd></div><div><dt className="text-white/60">{messages[locale].public.consultation.phone}</dt><dd className="mt-1"><a href={`tel:${item.phone}`} dir="ltr" aria-label={t.call.replace("{name}", item.name)} className="text-gold-light underline">{item.phone}</a></dd></div></dl></Section></div><Section title={t.serviceAndAppointment}><dl className="grid gap-4 text-sm md:grid-cols-3"><div><dt className="text-white/60">{t.service}</dt><dd className="mt-1 font-bold">{localizeServiceTitle(locale, item.service)}</dd></div><div><dt className="text-white/60">{t.requestedDate}</dt><dd className="mt-1">{formatLocaleDate(item.preferredDate, locale)}</dd></div><div><dt className="text-white/60">{t.requestedTime}</dt><dd className="mt-1"><bdi>{formatConsultationTime(item.preferredTime, locale)}</bdi></dd></div></dl></Section><Section title={t.message}><p className="whitespace-pre-wrap leading-7 text-white/85">{item.message || t.noMessage}</p></Section><Section title={t.statusAndActions}><div className="flex flex-wrap items-center justify-between gap-4"><ConsultationStatusBadge status={item.status} /><ConsultationStatusActions id={item.id} status={item.status} canManage={canManageConsultations(user.data.user.role)} /></div></Section></section>;
}

function DetailSkeleton() { const locale = useLocale(); return <section aria-busy="true" aria-label={messages[locale].admin.consultation.loading} className="mx-auto max-w-5xl space-y-4 p-8"><div className="h-8 w-64 animate-pulse rounded bg-white/10" />{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded bg-white/5" />)}</section>; }
