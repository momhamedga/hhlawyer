import { env } from "../../config/env.js";
import type { ConsultationNotification, ContactNotification, EmailNotifier } from "./email.types.js";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

class DisabledEmailNotifier implements EmailNotifier {
  readonly provider = "disabled";
  async sendContactNotification(_notification: ContactNotification) {}
  async sendConsultationNotification(_notification: ConsultationNotification) {}
}

class ResendEmailNotifier implements EmailNotifier {
  readonly provider = "resend";
  constructor(private readonly apiKey: string, private readonly from: string, private readonly to: string) {}

  private async send(subject: string, text: string, html: string) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: this.from, to: [this.to], subject, text, html }),
    });
    if (!response.ok) throw new Error("EMAIL_PROVIDER_REQUEST_FAILED");
  }

  async sendContactNotification(notification: ContactNotification) {
    const text = `New contact message\nName: ${notification.name}\nEmail: ${notification.email}\nSubject: ${notification.subject}\nReceived: ${notification.receivedAt.toISOString()}\n\n${notification.message}`;
    const html = `<h1>New contact message</h1><p><strong>Name:</strong> ${escapeHtml(notification.name)}</p><p><strong>Email:</strong> ${escapeHtml(notification.email)}</p><p><strong>Subject:</strong> ${escapeHtml(notification.subject)}</p><p><strong>Received:</strong> ${notification.receivedAt.toISOString()}</p><pre>${escapeHtml(notification.message)}</pre>`;
    await this.send(`Contact: ${notification.subject}`, text, html);
  }

  async sendConsultationNotification(notification: ConsultationNotification) {
    const text = `New consultation ${notification.referenceNumber}\nService: ${notification.serviceId}\nPreferred: ${notification.preferredDate.toISOString()} ${notification.preferredTime}`;
    await this.send(`Consultation: ${notification.referenceNumber}`, text, `<p>${escapeHtml(text)}</p>`);
  }
}

export function createEmailNotifier(): EmailNotifier {
  if (!env.EMAIL_ENABLED) return new DisabledEmailNotifier();
  return new ResendEmailNotifier(env.EMAIL_API_KEY!, env.EMAIL_FROM!, env.CONTACT_NOTIFICATION_TO!);
}

export function logNotificationFailure(requestId: string | undefined, provider: string, category: "contact" | "consultation") {
  console.error({ requestId, provider, category, code: "EMAIL_NOTIFICATION_FAILED" });
}
