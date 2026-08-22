import { afterEach, describe, expect, it, vi } from "vitest";
import { contactSubmissionSchema, consultationSubmissionSchema } from "@hhlawyer/validation";
import { DisabledEmailNotifier, ResendEmailNotifier } from "./email.service.js";
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

  it("uses Resend html, text, and reply_to fields without sending a real email", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));
    const notifier = new ResendEmailNotifier("test-api-key", "onboarding@resend.dev", "office@example.test");
    await notifier.sendConsultationNotification(consultation());
    expect(fetchMock).toHaveBeenCalledOnce();
    const request = fetchMock.mock.calls[0]?.[1];
    const body = JSON.parse(String(request?.body));
    expect(body).toMatchObject({ from: "onboarding@resend.dev", to: ["office@example.test"], reply_to: "amina@example.test" });
    expect(body.html).toContain("New Consultation Request");
    expect(body.text).toContain("Commercial and Corporate Law");
  });

  it("does not attempt delivery while email notifications are disabled", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const notifier = new DisabledEmailNotifier();
    await notifier.sendContactNotification(contact());
    await notifier.sendConsultationNotification(consultation());
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
