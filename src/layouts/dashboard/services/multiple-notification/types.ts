export interface SMSNotification {
  destination: string;
  message: string;
}

export interface EmailNotification {
  destination: string;
  subject: string;
  body: string;
  attachments?: string[];
}

export interface SlackNotification {
  destination: string;
  message: string;
}

export interface MultipleNotificationPayload {
  commonMessage: string;
  sms?: SMSNotification[];
  email?: EmailNotification[];
  slack?: SlackNotification[];
}

export type ServiceType = "sms" | "email" | "slack";
