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
    GET: (clientId: string) => `/api/webhook/configs?clientId=${clientId}`,
    UPDATE: (clientId: string) => `/api/webhook/config/${clientId}`,
    LIST: (clientId: string) => `/api/webhook/configs?clientId=${clientId}`,
    DELETE: (webhookId: string) => `/api/webhook/config/${webhookId}`,
    TOGGLE: (webhookId: string) => `/api/webhook/config/${webhookId}/toggle`,
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
