import type { ConsultationStatus, UserRole } from "@hhlawyer/types";

export const consultationStatusLabels: Record<ConsultationStatus, string> = {
  PENDING: "قيد المراجعة",
  CONFIRMED: "مؤكد",
  RESCHEDULED: "إعادة جدولة",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
};

export const consultationTransitions: Record<ConsultationStatus, readonly ConsultationStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["RESCHEDULED", "COMPLETED", "CANCELLED"],
  RESCHEDULED: ["CONFIRMED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canManageConsultations(role: UserRole) {
  return role === "ADMIN" || role === "LAWYER";
}

export function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat("ar-AE", {
    dateStyle: "medium",
    timeZone: "Asia/Dubai",
  }).format(new Date(value));
}

export function formatAdminDateTime(value: string) {
  return new Intl.DateTimeFormat("ar-AE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dubai",
  }).format(new Date(value));
}
