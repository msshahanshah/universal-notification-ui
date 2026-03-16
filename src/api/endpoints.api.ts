export const cleanQueryParams = (params?: Record<string, any>) => {
  if (!params) return {};

  return Object.entries(params).reduce((acc, [key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !(typeof value === "string" && value.trim() === "")
    ) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/login",
    REFRESH_TOKEN: "/refresh",
  },
  SERVICES: {
    NOTIFY: "/notify",
  },
  WEBHOOK: {
    SAVE: "/api/webhook/config",
    GET:`/api/webhook/configs`,
    UPDATE: ({ webhookId }: any) =>
      `/api/webhook/${webhookId}`,
    DELETE: (webhookId: string) => `/api/webhook/${webhookId}`,
    TOGGLE: (webhookId: string) => `/api/webhook/${webhookId}`,
  },
  MULTIPLE_NOTIFICATION: {
    SEND: "/v2/notify",
  },
LOGS: {
    LIST: (params?: Record<string, any>) => {
      const cleaned = cleanQueryParams(params);

      const query = new URLSearchParams(cleaned).toString();

      return query ? `/logs?${query}` : "/logs";
    },

    CREATE: "/logs",
    DELIVERY_STATUS: (id: string) => `/delivery-status/${id}`,
  
  },
};
