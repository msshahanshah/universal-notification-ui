import {
  EmailPayload,
  SlackPayload,
  SMSPayload,
} from "src/layouts/login/types";
import { MultipleNotificationPayload } from "src/layouts/dashboard/services/multiple-notification/types";
import api from "src/lib/axios";

import { ENDPOINTS } from "./endpoints.api";

// Template interfaces
export interface Template {
  id: number;
  templateId: string;
  name: string;
  service: string;
  messageContent: string;
  requiredFields: Array<{ name: string }>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TemplatesResponse {
  success: boolean;
  message: string;
  data: Template[];
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
  };
}

export const sendEmail = async (payload: EmailPayload) => {
  try {
    const response = await api.post(ENDPOINTS.SERVICES.NOTIFY, payload);

    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const sendSms = async (payload: SMSPayload) => {
  try {
    const response = await api.post(ENDPOINTS.SERVICES.NOTIFY, payload);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const sendSlack = async (payload: SlackPayload) => {
  try {
    const response = await api.post(ENDPOINTS.SERVICES.NOTIFY, payload);
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const sendMultipleNotifications = async (
  payload: MultipleNotificationPayload,
) => {
  try {
    const response = await api.post(
      ENDPOINTS.SERVICES.MULTIPLE_NOTIFICATION.SEND,
      payload,
    );

    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const getTemplates = async (
  service?: string,
): Promise<TemplatesResponse> => {
  try {
    const response = await api.get(ENDPOINTS.SERVICES.TEMPLATES, {
      params: service ? { service: service, limit: 100 } : { limit: 100 },
    });
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};