import { env } from "../../config/env.js";
import type { ConsultationNotification, ContactNotification, EmailNotifier } from "./email.types.js";
import { buildConsultationEmail, buildContactEmail, type EmailTemplate } from "./email.templates.js";

export class DisabledEmailNotifier implements EmailNotifier {
  readonly provider = "disabled";
  async sendContactNotification(_notification: ContactNotification) {}
  async sendConsultationNotification(_notification: ConsultationNotification) {}
}

export class ResendEmailNotifier implements EmailNotifier {
  readonly provider = "resend";
  constructor(private readonly apiKey: string, private readonly from: string, private readonly to: string) {}

  private async send(template: EmailTemplate) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: this.from, to: [this.to], subject: template.subject, text: template.text, html: template.html, reply_to: template.replyTo }),
    });
    if (!response.ok) throw new Error("EMAIL_PROVIDER_REQUEST_FAILED");
  }

  async sendContactNotification(notification: ContactNotification) {
    await this.send(buildContactEmail(notification));
  }

  async sendConsultationNotification(notification: ConsultationNotification) {
    await this.send(buildConsultationEmail(notification));
  }
}

export function createEmailNotifier(): EmailNotifier {
  if (!env.EMAIL_ENABLED) return new DisabledEmailNotifier();
  return new ResendEmailNotifier(env.EMAIL_API_KEY!, env.EMAIL_FROM!, env.CONTACT_NOTIFICATION_TO!);
}

export function logNotificationFailure(requestId: string | undefined, provider: string, category: "contact" | "consultation") {
  console.error({ requestId, provider, category, code: "EMAIL_NOTIFICATION_FAILED" });
}
