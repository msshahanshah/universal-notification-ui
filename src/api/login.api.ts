import { LoginPayload, LoginResponse } from "src/layouts/login/types";
import api from "src/lib/axios";

import { ENDPOINTS } from "./endpoints.api";

export const authenticate = async (payload: LoginPayload) => {
  const response = await api.post(ENDPOINTS.AUTH.LOGIN, payload);
  return response.data;
};

export const fetchRefreshToken = async (payload: any): Promise<any> => {
  const response = await api.post(ENDPOINTS.AUTH.REFRESH_TOKEN, payload);
  return response?.data;
};
