import api from "src/lib/axios";
import { ENDPOINTS } from "./endpoints.api";

export const saveWebhookDetails = async (body: any) => {
  try {
    const res = await api.post(ENDPOINTS.WEBHOOK.SAVE, body);
    return res.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const updateWebhookDetails = async ({
  payload,
  webhookId,
}: {
  payload: any;
  webhookId: string;
}) => {
  try {
    if (!webhookId) {
      throw new Error("Webhook ID is required");
    }
    const res = await api.patch(ENDPOINTS.WEBHOOK.UPDATE(webhookId), payload);
    return res.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const getWebhookDetails = async () => {
  try {
    const res = await api.get(ENDPOINTS.WEBHOOK.GET);
    return res.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const deleteWebhookConfig = async (webhookId: string) => {
  try {
    if (!webhookId) {
      throw new Error("Webhook ID is required");
    }
    const res = await api.delete(ENDPOINTS.WEBHOOK.DELETE(webhookId));
    return res.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const toggleWebhookConfig = async (webhookId: string, payload: any) => {
  try {
    if (!webhookId) {
      throw new Error("Webhook ID is required");
    }
    const res = await api.patch(ENDPOINTS.WEBHOOK.TOGGLE(webhookId), payload);
    return res.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};
