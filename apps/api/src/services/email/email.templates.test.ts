import { afterEach, describe, expect, it, vi } from "vitest";
import { contactSubmissionSchema, consultationSubmissionSchema } from "@hhlawyer/validation";
import { parseNotificationRecipients } from "../../config/env.js";
import { DisabledEmailNotifier, EmailProviderRequestError, logNotificationFailure, ResendEmailNotifier } from "./email.service.js";
import { buildConsultationEmail, buildContactEmail } from "./email.templates.js";
import type { ConsultationNotification, ContactNotification } from "./email.types.js";

const receivedAt = new Date("2026-08-22T12:34:00.000Z");
const preferredDate = new Date("2026-08-30T12:00:00.000Z");

function consultation(locale: "ar" | "en" = "en"): ConsultationNotification {
  return {
    referenceNumber: "CONS-2026-000123",
    serviceSlug: "commercial",
    serviceName: "Database service name",
    name: "Amina Client",
    email: "amina@example.test",
    phone: "+971501234567",
    preferredDate,
    preferredTime: "10:30 AM",
    receivedAt,
    message: "Please review <contract> & confirm.",
    locale,
  };
}

function contact(locale: "ar" | "en" = "en"): ContactNotification {
  return {
    name: "Amina Client",
    email: "amina@example.test",
    subject: "Commercial enquiry",
    message: "Please review <contract> & confirm.",
    receivedAt,
    locale,
  };
}

afterEach(() => vi.restoreAllMocks());

describe("professional email templates", () => {
  it("normalizes one notification recipient", () => {
    expect(parseNotificationRecipients("office@example.test")).toEqual(["office@example.test"]);
  });

  it("normalizes two comma-separated notification recipients", () => {
    expect(parseNotificationRecipients("first@example.test,second@example.test")).toEqual(["first@example.test", "second@example.test"]);
  });

  it("trims whitespace around notification recipients", () => {
    expect(parseNotificationRecipients(" first@example.test , second@example.test ")).toEqual(["first@example.test", "second@example.test"]);
  });

  it("rejects a malformed first notification recipient", () => {
    expect(() => parseNotificationRecipients("not-an-email,second@example.test")).toThrow("CONTACT_NOTIFICATION_TO_INVALID");
  });

  it("rejects a malformed second notification recipient", () => {
    expect(() => parseNotificationRecipients("first@example.test,not-an-email")).toThrow("CONTACT_NOTIFICATION_TO_INVALID");
  });

  it("rejects empty entries in the notification recipient list", () => {
    expect(() => parseNotificationRecipients("first@example.test,,second@example.test")).toThrow("CONTACT_NOTIFICATION_TO_INVALID");
    expect(() => parseNotificationRecipients("first@example.test,")).toThrow("CONTACT_NOTIFICATION_TO_INVALID");
  });

  it("removes exact duplicate notification recipients while preserving order", () => {
    expect(parseNotificationRecipients("first@example.test,second@example.test,first@example.test")).toEqual(["first@example.test", "second@example.test"]);
  });

  it("builds a readable English consultation email with a localized service title and reply-to", () => {
    const template = buildConsultationEmail(consultation());
    expect(template.subject).toBe("New Consultation — CONS-2026-000123");
    expect(template.replyTo).toBe("amina@example.test");
    expect(template.text).toContain("Commercial and Corporate Law");
    expect(template.html).toContain("Commercial and Corporate Law");
    expect(template.html).not.toContain("Database service name");
    expect(template.text).not.toContain("2026-08-30T12:00:00.000Z");
    expect(template.text).not.toContain("2026-08-22T12:34:00.000Z");
    expect(template.html).toContain("&lt;contract&gt; &amp; confirm.");
  });

  it("builds an RTL Arabic consultation email", () => {
    const template = buildConsultationEmail(consultation("ar"));
    expect(template.subject).toBe("استشارة جديدة — CONS-2026-000123");
    expect(template.html).toContain('lang="ar" dir="rtl"');
    expect(template.html).toContain("القانون التجاري والشركات");
    expect(template.text).toContain("رقم الاستشارة");
  });

  it("builds a contact email with text fallback, reply-to, and escaped customer content", () => {
    const template = buildContactEmail(contact());
    expect(template.subject).toBe("New Contact Message — Amina Client");
    expect(template.replyTo).toBe("amina@example.test");
    expect(template.text).toContain("Commercial enquiry");
    expect(template.html).toContain("&lt;contract&gt; &amp; confirm.");
    expect(template.html).not.toContain("<contract>");
  });

  it("prevents header injection in customer-derived contact subjects", () => {
    const template = buildContactEmail({ ...contact(), name: "Amina\r\nBcc: attacker@example.test" });
    expect(template.subject).toBe("New Contact Message — Amina Bcc: attacker@example.test");
    expect(template.subject).not.toMatch(/[\r\n]/);
  });

  it("accepts reply-to values only after the existing email validation rejects header characters", () => {
    expect(contactSubmissionSchema.safeParse({ name: "Amina Client", email: "amina@example.test\r\nBcc: attacker@example.test", subject: "Legal enquiry", message: "A sufficiently long legal enquiry message.", website: "" }).success).toBe(false);
    expect(consultationSubmissionSchema.safeParse({ serviceId: "ck000000000000000000000000", name: "Amina Client", email: "amina@example.test\r\nBcc: attacker@example.test", phone: "+971501234567", preferredDate: "2099-12-31", preferredTime: "09:00 AM", website: "" }).success).toBe(false);
  });

  it("passes the complete recipient set to Resend for consultation notifications", async () => {
    const infoMock = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "safe-message-id" }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const notifier = new ResendEmailNotifier("test-api-key", "onboarding@resend.dev", ["primary@example.test", "backup@example.test"]);
    await notifier.sendConsultationNotification(consultation());
    expect(fetchMock).toHaveBeenCalledOnce();
    const request = fetchMock.mock.calls[0]?.[1];
    const body = JSON.parse(String(request?.body));
    expect(body).toMatchObject({ from: "onboarding@resend.dev", to: ["primary@example.test", "backup@example.test"], reply_to: "amina@example.test" });
    expect(body.html).toContain("New Consultation Request");
    expect(body.text).toContain("Commercial and Corporate Law");
    expect(infoMock).toHaveBeenCalledWith({ provider: "resend", category: "consultation", code: "EMAIL_NOTIFICATION_ACCEPTED", status: 200, messageId: "safe-message-id", recipientCount: 2 });
  });

  it("passes the complete recipient set to Resend for contact notifications", async () => {
    const infoMock = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "safe-message-id" }), { status: 200, headers: { "Content-Type": "application/json" } }));
    const notifier = new ResendEmailNotifier("test-api-key", "onboarding@resend.dev", ["primary@example.test", "backup@example.test"]);
    await notifier.sendContactNotification(contact());
    expect(fetchMock).toHaveBeenCalledOnce();
    const request = fetchMock.mock.calls[0]?.[1];
    const body = JSON.parse(String(request?.body));
    expect(body).toMatchObject({ from: "onboarding@resend.dev", to: ["primary@example.test", "backup@example.test"], reply_to: "amina@example.test" });
    expect(body.html).toContain("New Contact Message");
    expect(body.text).toContain("Commercial enquiry");
    expect(infoMock).toHaveBeenCalledWith({ provider: "resend", category: "contact", code: "EMAIL_NOTIFICATION_ACCEPTED", status: 200, messageId: "safe-message-id", recipientCount: 2 });
  });

  it("logs only safe provider metadata when Resend rejects a notification", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    const errorMock = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ name: "validation_error", message: "Rejected recipient private@example.test" }), { status: 422, headers: { "Content-Type": "application/json" } }));
    const notifier = new ResendEmailNotifier("test-api-key", "sender@example.test", ["primary@example.test", "backup@example.test"]);

    let providerError: unknown;
    try {
      await notifier.sendContactNotification(contact());
    } catch (error) {
      providerError = error;
    }

    expect(providerError).toBeInstanceOf(EmailProviderRequestError);
    logNotificationFailure("safe-request-id", notifier.provider, "contact", providerError);
    expect(errorMock).toHaveBeenCalledWith({ requestId: "safe-request-id", provider: "resend", category: "contact", code: "EMAIL_NOTIFICATION_FAILED", status: 422, providerCode: "validation_error" });
    expect(JSON.stringify(errorMock.mock.calls)).not.toMatch(/private@example\.test|test-api-key|Rejected recipient/);
  });

  it("does not attempt delivery while email notifications are disabled", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const notifier = new DisabledEmailNotifier();
    await notifier.sendContactNotification(contact());
    await notifier.sendConsultationNotification(consultation());
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
