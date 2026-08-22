export type EmailLocale = "ar" | "en";

export interface ContactNotification {
  name: string;
  email: string;
  subject: string;
  message: string;
  receivedAt: Date;
  locale: EmailLocale;
}

export interface ConsultationNotification {
  referenceNumber: string;
  serviceSlug: string;
  serviceName: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: Date;
  preferredTime: string;
  receivedAt: Date;
  message?: string;
  locale: EmailLocale;
}

export interface EmailNotifier {
  readonly provider: string;
  sendContactNotification(notification: ContactNotification): Promise<void>;
  sendConsultationNotification(notification: ConsultationNotification): Promise<void>;
}
