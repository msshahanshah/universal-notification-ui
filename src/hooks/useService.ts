import { useMutation } from "@tanstack/react-query";

import { sendEmail, sendSlack, sendSms } from "src/api/service.api";

export const useEmailService = () => {
  return useMutation({
    mutationFn: sendEmail,
    retry: false,
  });
};

export const useSlackService = () => {
  return useMutation({
    mutationFn: sendSlack,
    retry: false,
  });
};

export const useSmsService = () => {
  return useMutation({
    mutationFn: sendSms,
    retry: false,
  });
};

