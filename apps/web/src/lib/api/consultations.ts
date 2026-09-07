import type { ConsultationCreated, ConsultationSubmission, ContactMessageCreated, ContactSubmission, PublicService } from "@hhlawyer/types";
import type { Locale } from "@/i18n/locale";
import { apiFetch } from "./client";

export function createConsultation(input: ConsultationSubmission, locale: Locale, signal?: AbortSignal) {
  return apiFetch<ConsultationCreated>("/consultations", {
    method: "POST", signal, headers: { "Content-Type": "application/json", "Accept-Language": locale }, body: JSON.stringify(input),
  });
}

export function getActiveServices(signal?: AbortSignal) {
  return apiFetch<PublicService[]>("/services", { signal });
}

export function createContactMessage(input: ContactSubmission, locale: Locale, signal?: AbortSignal) {
  return apiFetch<ContactMessageCreated>("/contact", { method: "POST", signal, headers: { "Content-Type": "application/json", "Accept-Language": locale }, body: JSON.stringify(input) });
}
