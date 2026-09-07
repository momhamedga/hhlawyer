import type { ContactMessageStatus, ConsultationStatus } from "@hhlawyer/types";

export type DashboardStatusTone = "info" | "attention" | "success" | "danger";

export function consultationTone(status: ConsultationStatus): DashboardStatusTone {
  if (status === "PENDING" || status === "RESCHEDULED") return "attention";
  if (status === "COMPLETED") return "success";
  if (status === "CANCELLED") return "danger";
  return "info";
}

export function contactTone(status: ContactMessageStatus): DashboardStatusTone {
  if (status === "UNREAD") return "attention";
  if (status === "REPLIED") return "success";
  return "info";
}

export function activityHref(entity: string, entityId: string | null) {
  if (!entityId) return null;
  if (entity === "Consultation") return `/admin/consultations/${entityId}`;
  if (entity === "ContactMessage") return `/admin/contacts/${entityId}`;
  if (entity === "User") return `/admin/users/${entityId}`;
  if (entity === "Service") return `/admin/services/${entityId}`;
  return null;
}
