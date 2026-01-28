export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

export interface EmailPayload {
  service: string;
  destination: string;
  subject: string;
  body: string;
  fromEmail: string;
  cc?: string;
  bcc?: string;
}

export interface SMSPayload {
  service: string;
  destination: number | null;
  message: string;
}

export interface SlackPayload {
  service: string;
  destination: string;
  message: string;
}