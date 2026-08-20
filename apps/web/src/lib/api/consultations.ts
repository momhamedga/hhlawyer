import type { ConsultationCreated, ConsultationSubmission, ContactMessageCreated, ContactSubmission, PublicService } from "@hhlawyer/types";
import { apiFetch } from "./client";

export function createConsultation(input: ConsultationSubmission, signal?: AbortSignal) {
  return apiFetch<ConsultationCreated>("/consultations", {
    method: "POST", signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
  });
}

export function getActiveServices(signal?: AbortSignal) {
  return apiFetch<PublicService[]>("/services", { signal });
}

export function createContactMessage(input: ContactSubmission, signal?: AbortSignal) {
  return apiFetch<ContactMessageCreated>("/contact", { method: "POST", signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
}
