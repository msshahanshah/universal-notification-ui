import { useQuery } from "@tanstack/react-query";
import { getTemplates, Template } from "src/api/service.api";
import { templatesKeys } from "src/api/queryKeys";

export const useTemplates = (service: string = "whatsapp") => {
  return useQuery({
    queryKey: templatesKeys.list(service),
    queryFn: () => getTemplates(service),
    enabled: !!service,
    refetchOnWindowFocus: false,
    select: (data) => data.data.filter(template => template.service === service),
  });
};

export const useTemplateById = (templateId: string, service: string = "whatsapp") => {
  return useQuery({
    queryKey: ["template", templateId, service],
    queryFn: async () => {
      const response = await getTemplates(service);
      return response.data.find(template => template.templateId === templateId);
    },
    enabled: !!templateId && !!service,
    refetchOnWindowFocus: false,
  });
};
