import type {
  AdminConsultationDetail,
  AdminConsultationListResponse,
  AdminConsultationStatusUpdateInput,
  ConsultationStatus,
} from "@hhlawyer/types";
import { apiFetch } from "./client";

export interface AdminConsultationFilters {
  page: number;
  limit: number;
  search?: string;
  status?: ConsultationStatus;
  serviceId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy: "createdAt" | "preferredDate" | "status";
  sortOrder: "asc" | "desc";
}

export const adminConsultationsKeys = {
  all: ["admin", "consultations"] as const,
  list: (filters: AdminConsultationFilters) => [...adminConsultationsKeys.all, "list", filters] as const,
  detail: (id: string) => [...adminConsultationsKeys.all, "detail", id] as const,
};

function queryString(filters: AdminConsultationFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return params.toString();
}

export function getAdminConsultations(filters: AdminConsultationFilters, signal?: AbortSignal) {
  return apiFetch<AdminConsultationListResponse>(`/admin/consultations?${queryString(filters)}`, {
    credentials: "include",
    signal,
  });
}

export function getAdminConsultation(id: string, signal?: AbortSignal) {
  return apiFetch<AdminConsultationDetail>(`/admin/consultations/${encodeURIComponent(id)}`, {
    credentials: "include",
    signal,
  });
}

export function updateAdminConsultationStatus(id: string, status: ConsultationStatus) {
  const input: AdminConsultationStatusUpdateInput = { status };
  return apiFetch<{ id: string; status: ConsultationStatus }>(
    `/admin/consultations/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}
