"use client";

import type { ConsultationStatus } from "@hhlawyer/types";
import { AdminStatusBadge } from "@/components/admin/foundation";
import { useLocale } from "@/components/providers/LocaleProvider";
import { displayEnum } from "@/i18n/format";
import { statusTone } from "./consultations-model";

export function ConsultationStatusBadge({ status }: { status: ConsultationStatus }) {
  const locale = useLocale();
  return <AdminStatusBadge tone={statusTone(status)}>{displayEnum(locale, status)}</AdminStatusBadge>;
}
