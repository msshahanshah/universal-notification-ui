import api from "src/lib/axios";

import { cleanQueryParams, ENDPOINTS } from "./endpoints.api";

export const fetchLogs = async (params?: Record<string, any>) => {
  try {
    const cleaned = cleanQueryParams(params);

    const res = await api.get("/logs", {
      params: cleaned,
    });

    return res?.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const fetchLogStatus = async (id: string) => {
  try {
    const response = await api.get(ENDPOINTS.LOGS.DELIVERY_STATUS(id));
    return response?.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};
