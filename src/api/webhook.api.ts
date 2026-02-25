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
      "http://localhost:3000" + ENDPOINTS.WEBHOOK.UPDATE(body?.client_id),
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
      "http://localhost:3000" + ENDPOINTS.WEBHOOK.GET(clientId),
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
