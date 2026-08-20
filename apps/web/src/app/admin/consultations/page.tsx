"use client";

import { Suspense } from "react";
import { ConsultationsPageClient } from "@/components/admin/consultations/ConsultationsPageClient";
import { useLocale } from "@/components/providers/LocaleProvider";
import { messages } from "@/i18n/messages";

export default function AdminConsultationsPage() {
  const locale = useLocale();
  return <Suspense fallback={<div className="p-8" aria-busy="true">{messages[locale].admin.consultation.loading}</div>}><ConsultationsPageClient /></Suspense>;
}
