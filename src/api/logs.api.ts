import api from "src/lib/axios";

import { ENDPOINTS } from "./endpoints.api";

export const fetchLogs = async (params?: Record<string, any>) => {
  try {
    const res = await api.get(ENDPOINTS.LOGS.LIST(params));
    return res.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};

export const fetchLogStatus = async (id: number) => {
  try {
    const response = await api.get(ENDPOINTS.LOGS.DELIVERY_STATUS(id));
    return response.data;
  } catch (error: any) {
    throw error?.response?.data;
  }
};
