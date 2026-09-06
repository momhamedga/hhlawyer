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
  constructor(private readonly apiKey: string, private readonly from: string, private readonly to: readonly string[]) {}

  private async send(template: EmailTemplate, category: "contact" | "consultation") {
    console.info({ provider: this.provider, category, code: "EMAIL_NOTIFICATION_ATTEMPT", recipientCount: this.to.length });
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: this.from, to: this.to, subject: template.subject, text: template.text, html: template.html, reply_to: template.replyTo }),
    });
    const result: unknown = await response.json().catch(() => undefined);
    const providerCode = safeProviderValue(result, "name");

    if (!response.ok) throw new EmailProviderRequestError(response.status, providerCode);

    console.info({
      provider: this.provider,
      category,
      code: "EMAIL_NOTIFICATION_ACCEPTED",
      status: response.status,
      messageId: safeProviderValue(result, "id"),
      recipientCount: this.to.length,
    });
  }

  async sendContactNotification(notification: ContactNotification) {
    await this.send(buildContactEmail(notification), "contact");
  }

  async sendConsultationNotification(notification: ConsultationNotification) {
    await this.send(buildConsultationEmail(notification), "consultation");
  }
}

export class EmailProviderRequestError extends Error {
  constructor(public readonly status: number, public readonly providerCode?: string) {
    super("EMAIL_PROVIDER_REQUEST_FAILED");
    this.name = "EmailProviderRequestError";
  }
}

function safeProviderValue(value: unknown, key: "id" | "name") {
  if (typeof value !== "object" || value === null || !(key in value)) return undefined;
  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === "string" && /^[a-zA-Z0-9._-]{1,128}$/.test(candidate) ? candidate : undefined;
}

export function createEmailNotifier(): EmailNotifier {
  if (!env.EMAIL_ENABLED) return new DisabledEmailNotifier();
  return new ResendEmailNotifier(env.EMAIL_API_KEY!, env.EMAIL_FROM!, env.CONTACT_NOTIFICATION_TO!);
}

export function logNotificationFailure(requestId: string | undefined, provider: string, category: "contact" | "consultation", error?: unknown) {
  console.error({
    requestId,
    provider,
    category,
    code: "EMAIL_NOTIFICATION_FAILED",
    ...(error instanceof EmailProviderRequestError ? { status: error.status, providerCode: error.providerCode } : {}),
  });
}
