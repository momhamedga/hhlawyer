import type { ConsultationStatus } from "@hhlawyer/types";
import { displayEnum } from "@/i18n/format";
import { useLocale } from "@/components/providers/LocaleProvider";

const style: Record<ConsultationStatus, string> = {
  PENDING: "border-amber-300/40 bg-amber-400/15 text-amber-100",
  CONFIRMED: "border-sky-300/40 bg-sky-400/15 text-sky-100",
  RESCHEDULED: "border-violet-300/40 bg-violet-400/15 text-violet-100",
  COMPLETED: "border-emerald-300/40 bg-emerald-400/15 text-emerald-100",
  CANCELLED: "border-rose-300/40 bg-rose-400/15 text-rose-100",
};

export function ConsultationStatusBadge({ status }: { status: ConsultationStatus }) {
  const locale = useLocale();
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${style[status]}`}>{displayEnum(locale, status)}</span>;
}
