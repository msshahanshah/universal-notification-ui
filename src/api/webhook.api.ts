import api from "src/lib/axios"; // do not remove
// import axios from "axios";
import { ENDPOINTS } from "./endpoints.api";

export const saveWebhookDetails = async (body) => {
  try {
    const res = await api.post(ENDPOINTS.WEBHOOK.SAVE, body);
    return res.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const updateWebhookDetails = async (body) => {
  try {
    const res = await api.patch(ENDPOINTS.WEBHOOK.UPDATE(body), body);
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
  console.log("webhookId",webhookId)
  try {
    const res = await api.delete(ENDPOINTS.WEBHOOK.DELETE(webhookId));
    return res.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const toggleWebhookConfig = async (webhookId: string, payload: any) => {
  console.log("webhookId",webhookId)
  try {
    const res = await api.patch(ENDPOINTS.WEBHOOK.TOGGLE(webhookId), payload);
    return res.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};
