export const DRAWER_WIDTH = 218;
export const DRAWER_TOP_MARGIN = 150;
export const COLLAPSED_WIDTH = 64;

export const usernameRegex = /^[a-zA-Z]{3,10}@[a-zA-Z]{1,5}$/;
export const passwordRegex = /^[^\s]{8,12}$/;
export const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const slackRegex = /^[CGD][A-Z0-9]{8,10}$/;

// Service configuration for notifications
export const SERVICE_CONFIG = [
  { key: "sms", label: "SMS" },
  { key: "email", label: "Email" },
  { key: "slack", label: "Slack" },
  { key: "whatsapp", label: "Whatsapp" },
] as const;