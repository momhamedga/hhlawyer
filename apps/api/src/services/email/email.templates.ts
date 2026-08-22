import type { ConsultationNotification, ContactNotification, EmailLocale } from "./email.types.js";

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
  replyTo: string;
}

type Copy = {
  consultationTitle: string;
  contactTitle: string;
  brand: string;
  consultationSubject: (reference: string) => string;
  contactSubject: (name: string) => string;
  reference: string;
  service: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  received: string;
  noMessage: string;
};

const copy: Record<EmailLocale, Copy> = {
  ar: {
    consultationTitle: "طلب استشارة جديد",
    contactTitle: "رسالة تواصل جديدة",
    brand: "حسين الحارثي للمحاماة والاستشارات القانونية",
    consultationSubject: (reference) => `استشارة جديدة — ${reference}`,
    contactSubject: (name) => `رسالة تواصل جديدة — ${name}`,
    reference: "رقم الاستشارة",
    service: "الخدمة",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    subject: "الموضوع",
    preferredDate: "التاريخ المفضل",
    preferredTime: "الوقت المفضل",
    message: "الرسالة",
    received: "وقت الاستلام",
    noMessage: "لا توجد رسالة مرفقة.",
  },
  en: {
    consultationTitle: "New Consultation Request",
    contactTitle: "New Contact Message",
    brand: "Hussein Al Harthi Advocates & Legal Consultants",
    consultationSubject: (reference) => `New Consultation — ${reference}`,
    contactSubject: (name) => `New Contact Message — ${name}`,
    reference: "Reference Number",
    service: "Service",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    subject: "Subject",
    preferredDate: "Preferred Date",
    preferredTime: "Preferred Time",
    message: "Message",
    received: "Received",
    noMessage: "No message provided.",
  },
};

const serviceTitles: Record<string, Record<EmailLocale, string>> = {
  criminal: { ar: "القانون الجنائي", en: "Criminal Law" },
  commercial: { ar: "القانون التجاري والشركات", en: "Commercial and Corporate Law" },
  civil: { ar: "الأحوال الشخصية والمنازعات المدنية", en: "Personal Status and Civil Matters" },
  notary: { ar: "خدمات الكاتب العدل الخاص", en: "Private Notary Services" },
  taxes: { ar: "الضرائب والامتثال", en: "Tax and Compliance" },
};

export function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function headerValue(value: string) {
  return value.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(value: Date, locale: EmailLocale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-AE-u-nu-latn" : "en-AE", {
    timeZone: "Asia/Dubai",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value);
}

function formatTime(value: string, locale: EmailLocale) {
  const match = /^(\d{1,2}):(\d{2})\s(AM|PM)$/.exec(value);
  if (!match) return value;
  const [, hours, minutes, period] = match;
  const hour = (Number(hours) % 12) + (period === "PM" ? 12 : 0);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-AE-u-nu-latn" : "en-AE", {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(Date.UTC(2000, 0, 1, hour, Number(minutes))));
}

function formatDateTime(value: Date, locale: EmailLocale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-AE-u-nu-latn" : "en-AE", {
    timeZone: "Asia/Dubai",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

export function resolveLocalizedServiceTitle(slug: string, fallbackName: string, locale: EmailLocale) {
  return serviceTitles[slug]?.[locale] ?? fallbackName;
}

function fieldRow(label: string, value: string) {
  return `<tr><td style="padding:10px 0;border-bottom:1px solid #e7ded2;color:#766d64;font:600 13px/1.45 Arial,sans-serif;vertical-align:top;width:42%;">${escapeHtml(label)}</td><td style="padding:10px 0;border-bottom:1px solid #e7ded2;color:#211a15;font:400 15px/1.45 Arial,sans-serif;vertical-align:top;word-break:break-word;">${escapeHtml(value)}</td></tr>`;
}

function emailShell(locale: EmailLocale, title: string, detailRows: string, messageLabel: string, message: string) {
  const direction = locale === "ar" ? "rtl" : "ltr";
  const safeMessage = escapeHtml(message);
  return `<!doctype html><html lang="${locale}" dir="${direction}"><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f5efe6;color:#211a15;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f5efe6;"><tr><td align="center" style="padding:24px 12px;"><table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e7ded2;"><tr><td style="padding:26px 28px 20px;background:#211a15;border-bottom:4px solid #b08a43;"><p style="margin:0 0 8px;color:#d7bc7e;font:700 12px/1.4 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;">${escapeHtml(copy[locale].brand)}</p><h1 style="margin:0;color:#ffffff;font:700 24px/1.3 Arial,sans-serif;">${escapeHtml(title)}</h1></td></tr><tr><td style="padding:18px 28px 28px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${detailRows}</table><div style="margin-top:22px;padding:16px;border:1px solid #e7ded2;background:#fbf8f3;"><p style="margin:0 0 8px;color:#766d64;font:600 13px/1.45 Arial,sans-serif;">${escapeHtml(messageLabel)}</p><div style="color:#211a15;font:400 15px/1.6 Arial,sans-serif;white-space:pre-wrap;word-break:break-word;">${safeMessage}</div></div></td></tr><tr><td style="padding:0 28px 24px;color:#766d64;font:400 12px/1.5 Arial,sans-serif;">${escapeHtml(copy[locale].brand)}</td></tr></table></td></tr></table></body></html>`;
}

export function buildConsultationEmail(notification: ConsultationNotification): EmailTemplate {
  const locale = notification.locale;
  const t = copy[locale];
  const serviceTitle = resolveLocalizedServiceTitle(notification.serviceSlug, notification.serviceName, locale);
  const message = notification.message ?? t.noMessage;
  const rows = [
    fieldRow(t.reference, notification.referenceNumber),
    fieldRow(t.service, serviceTitle),
    fieldRow(t.fullName, notification.name),
    fieldRow(t.email, notification.email),
    fieldRow(t.phone, notification.phone),
    fieldRow(t.preferredDate, formatDate(notification.preferredDate, locale)),
    fieldRow(t.preferredTime, formatTime(notification.preferredTime, locale)),
    fieldRow(t.received, formatDateTime(notification.receivedAt, locale)),
  ].join("");
  return {
    subject: t.consultationSubject(headerValue(notification.referenceNumber)),
    text: `${t.consultationTitle}\n\n${t.reference}: ${notification.referenceNumber}\n${t.service}: ${serviceTitle}\n${t.fullName}: ${notification.name}\n${t.email}: ${notification.email}\n${t.phone}: ${notification.phone}\n${t.preferredDate}: ${formatDate(notification.preferredDate, locale)}\n${t.preferredTime}: ${formatTime(notification.preferredTime, locale)}\n${t.received}: ${formatDateTime(notification.receivedAt, locale)}\n\n${t.message}:\n${message}`,
    html: emailShell(locale, t.consultationTitle, rows, t.message, message),
    replyTo: notification.email,
  };
}

export function buildContactEmail(notification: ContactNotification): EmailTemplate {
  const locale = notification.locale;
  const t = copy[locale];
  const rows = [
    fieldRow(t.fullName, notification.name),
    fieldRow(t.email, notification.email),
    fieldRow(t.subject, notification.subject),
    fieldRow(t.received, formatDateTime(notification.receivedAt, locale)),
  ].join("");
  return {
    subject: t.contactSubject(headerValue(notification.name)),
    text: `${t.contactTitle}\n\n${t.fullName}: ${notification.name}\n${t.email}: ${notification.email}\n${t.subject}: ${notification.subject}\n${t.received}: ${formatDateTime(notification.receivedAt, locale)}\n\n${t.message}:\n${notification.message}`,
    html: emailShell(locale, t.contactTitle, rows, t.message, notification.message),
    replyTo: notification.email,
  };
}
