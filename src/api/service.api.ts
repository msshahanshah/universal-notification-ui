import {
  EmailPayload,
  SlackPayload,
  SMSPayload,
} from "src/layouts/login/types";
import { MultipleNotificationPayload } from "src/layouts/dashboard/services/multiple-notification/types";
import api from "src/lib/axios";

import { ENDPOINTS } from "./endpoints.api";

export const sendEmail = async (payload: EmailPayload) => {
  const response = await api.post(ENDPOINTS.SERVICES.NOTIFY, payload);
  return response.data;
};

export const sendSms = async (payload: SMSPayload) => {
  const response = await api.post(ENDPOINTS.SERVICES.NOTIFY, payload);
  return response.data;
};

export const sendSlack = async (payload: SlackPayload) => {
  const response = await api.post(ENDPOINTS.SERVICES.NOTIFY, payload);
  return response.data;
};

export const sendMultipleNotifications = async (
  payload: MultipleNotificationPayload
) => {
  const response = await api.post(ENDPOINTS.MULTIPLE_NOTIFICATION.SEND, payload);
  return response.data;
};
