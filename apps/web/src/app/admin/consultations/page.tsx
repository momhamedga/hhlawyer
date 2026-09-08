"use client";

import { Suspense } from "react";
import { ConsultationListPage, ConsultationListSkeleton } from "@/features/admin/consultations";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function AdminConsultationsPage() {
  const locale = useLocale();
  return <Suspense fallback={<ConsultationListSkeleton locale={locale} />}><ConsultationListPage /></Suspense>;
}
