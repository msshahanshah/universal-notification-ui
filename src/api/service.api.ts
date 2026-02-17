import {
  EmailPayload,
  SlackPayload,
  SMSPayload,
} from "src/layouts/login/types";
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
