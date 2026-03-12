// import api from "src/lib/axios"; // do not remove
import axios from "axios";
import { ENDPOINTS } from "./endpoints.api";

export const saveWebhookDetails = async (body) => {
  try {
    const res = await axios.post(
      "http://localhost:3000" + ENDPOINTS.WEBHOOK.SAVE,
      body,
      {
        // Remove after BE is completed
        headers: {
          Accept: "application/json", // bearer token
          "X-Client-Id": localStorage.getItem("clientId") || "",
        },
      },
    );
    return res.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const updateWebhookDetails = async (body) => {
  try {
    const res = await axios.patch(
      "http://localhost:3000" + ENDPOINTS.WEBHOOK.UPDATE(body),
      body,
      {
        // Remove after BE is completed
        headers: {
          Accept: "application/json", // bearer token
          "X-Client-Id": localStorage.getItem("clientId") || "",
        },
      },
    );
    return res.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const getWebhookDetails = async (clientId: string) => {
  try {
    const res = await axios.get(
      "http://localhost:3000" + ENDPOINTS.WEBHOOK.GET,
      {
        // Remove after BE is completed
        headers: {
          "X-Client-Id": clientId || "",
        },
      },
    );
    return res.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const deleteWebhookConfig = async (webhookId: string) => {
  try {
    const res = await axios.delete(
      "http://localhost:3000" + ENDPOINTS.WEBHOOK.DELETE(webhookId),
      {
        headers: {
          "X-Client-Id": localStorage.getItem("clientId") || "",
        },
      },
    );
    return res.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const toggleWebhookConfig = async (webhookId: string, payload) => {
  try {
    const res = await axios.patch(
      "http://localhost:3000" + ENDPOINTS.WEBHOOK.TOGGLE(webhookId),
      payload,
      {
        headers: {
          "X-Client-Id": localStorage.getItem("clientId") || "",
        },
      },
    );
    return res.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};
