export interface ContactNotification {
  name: string;
  email: string;
  subject: string;
  message: string;
  receivedAt: Date;
}

export interface ConsultationNotification {
  referenceNumber: string;
  serviceId: string;
  preferredDate: Date;
  preferredTime: string;
  receivedAt: Date;
}

export interface EmailNotifier {
  readonly provider: string;
  sendContactNotification(notification: ContactNotification): Promise<void>;
  sendConsultationNotification(notification: ConsultationNotification): Promise<void>;
}
