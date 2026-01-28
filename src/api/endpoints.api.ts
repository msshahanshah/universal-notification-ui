export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/login",
    REFRESH_TOKEN: "/refresh",
  },
  SERVICES: {
    NOTIFY: "/notify",
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
