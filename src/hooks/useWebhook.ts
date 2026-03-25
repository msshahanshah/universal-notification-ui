import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWebhookDetails,
  saveWebhookDetails,
  updateWebhookDetails,
  deleteWebhookConfig,
  toggleWebhookConfig,
} from "src/api/webhook.api";

export const useSaveWebhookDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveWebhookDetails,
    retry: false,
    onSuccess: () => {
      const clientId = localStorage.getItem("clientId");
      queryClient.invalidateQueries({ queryKey: ["webhooks", clientId] });
    },
  });
};

export const useUpdateWebhookDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateWebhookDetails,
    retry: false,
    onSuccess: () => {
      const clientId = localStorage.getItem("clientId");
      queryClient.invalidateQueries({ queryKey: ["webhooks", clientId] });
    },
  });
};

export const useGetWebhookDetails = (clientId) => {
  return useQuery({
    queryKey: ["webhooks", clientId],
    queryFn: () => getWebhookDetails(clientId),
    enabled: !!clientId,
    refetchOnWindowFocus: true,
  });
};

export const useDeleteWebhook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWebhookConfig,
    retry: false,
    onSuccess: () => {
      const clientId = localStorage.getItem("clientId");
      queryClient.invalidateQueries({ queryKey: ["webhooks", clientId] });
    },
  });
};

export const useToggleWebhook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ webhookId,payload }: { webhookId: string;payload: any }) =>
      toggleWebhookConfig(webhookId, payload),
    retry: false,
    onSuccess: () => {
      const clientId = localStorage.getItem("clientId");
      queryClient.invalidateQueries({ queryKey: ["webhooks", clientId] });
    },
  });
};
