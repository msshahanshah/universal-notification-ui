import api from "src/lib/axios";

import { ENDPOINTS } from "./endpoints.api";

export const fetchLogs = async (params?: Record<string, any>) => {
  const response = await api.get(ENDPOINTS.LOGS.LIST(params));
  return response.data;
};

export const fetchLogStatus = async (id: number) => {
  const response = await api.get(ENDPOINTS.LOGS.DELIVERY_STATUS(id));
  return response.data;
};
