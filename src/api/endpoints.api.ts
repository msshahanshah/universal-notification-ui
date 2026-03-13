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
      if (!params || Object.keys(params).length === 0) {
        return "/logs";
      }

      const query = new URLSearchParams(
        Object.entries(params).reduce(
          (acc, [key, value]) => {
            if (value !== undefined && value !== null) {
              acc[key] = String(value);
            }
            return acc;
          },
          {} as Record<string, string>,
        ),
      ).toString();

      return `/logs?${query}`;
    },
    CREATE: "/logs",
    DELIVERY_STATUS: (id: number) => `/delivery-status/${id}`,
  },
};
