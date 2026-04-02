import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWebhookDetails,
  saveWebhookDetails,
  updateWebhookDetails,
  deleteWebhookConfig,
  toggleWebhookConfig,
  getWebhookLogs,
} from "src/api/webhook.api";

export const useSaveWebhookDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveWebhookDetails,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
  });
};

export const useUpdateWebhookDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateWebhookDetails,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
  });
};

export const useGetWebhookDetails = () => {
  return useQuery({
    queryKey: ["webhooks"],
    queryFn: () => getWebhookDetails(),
    refetchOnWindowFocus: true,
  });
};

export const useWebhookLogs = () => {
  return useQuery({
    queryKey: ["webhookLogs"],
    queryFn: () => getWebhookLogs(),
    refetchOnWindowFocus: false,
  });
};

export const useDeleteWebhook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWebhookConfig,
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
  });
};

export const useToggleWebhook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { webhookId: string; payload: any }) =>
      toggleWebhookConfig(data.webhookId, data.payload),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
    },
  });
};
