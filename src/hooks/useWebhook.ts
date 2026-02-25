import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getWebhookDetails,
  saveWebhookDetails,
  updateWebhookDetails,
} from "src/api/webhook.api";

export const useSaveWebhookDetails = () => {
  return useMutation({
    mutationFn: saveWebhookDetails,
    retry: false,
  });
};

export const useUpdateWebhookDetails = () => {
  return useMutation({
    mutationFn: updateWebhookDetails,
    retry: false,
  });
};

export const useGetWebhookDetails = (clientId) => {
  return useQuery({
    queryKey: ["webhook", clientId],
    queryFn: () => getWebhookDetails(clientId),
    enabled: !!clientId,
    refetchOnWindowFocus: true,
  });
};
