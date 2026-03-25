export const authKeys = {
  login: ["login"] as const,
};

export const logsKeys = {
  all: ["logs"] as const,
  list: (params?: Record<string, any>) =>
    [...logsKeys.all, "list", params] as const,
  status: ["status"] as const,
};

export const templatesKeys = {
  all: ["templates"] as const,
  list: (service?: string) => [...templatesKeys.all, "list", service] as const,
};