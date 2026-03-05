export const buildWebhookConfig = (statuses: string[]) =>
  statuses.reduce(
    (acc, item) => {
      const [service, trigger] = item.split("_");

      acc.settings[service] = true;

      if (!acc.service_trigger[service]) {
        acc.service_trigger[service] = [];
      }

      acc.service_trigger[service].push(trigger);

      return acc;
    },
    {
      settings: {} as Record<string, boolean>,
      service_trigger: {} as Record<string, string[]>,
    },
  );

export const transformServiceTriggerToStatuses = (
  serviceTrigger: Record<string, string[]>,
) => {
  if (!serviceTrigger) return [];

  return Object.entries(serviceTrigger).flatMap(([service, triggers]) =>
    (triggers || []).map((trigger) => `${service}_${trigger}`),
  );
};


export const buildServiceTrigger = (statuses) => {
  const result = {};

  statuses.forEach((status) => {
    const [service, event] = status.split("_");

    if (!result[service]) {
      result[service] = [];
    }

    result[service].push(event);
  });

  return result;
};

export const buildSettings = (existingSettings = {}, newServiceTrigger = {}) => {
  const settings = {};

  const existingServices = Object.keys(existingSettings);
  const newServices = Object.keys(newServiceTrigger);

  const allServices = new Set([...existingServices, ...newServices]);

  allServices.forEach((service) => {
    settings[service] = newServices.includes(service);
  });

  return settings;
};