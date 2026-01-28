import { useMutation } from "@tanstack/react-query";

import { authenticate, fetchRefreshToken } from "src/api/login.api";

export const useAuthenticate = () => {
  return useMutation({
    mutationFn: authenticate,
    retry: false,
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: fetchRefreshToken,
    onSuccess: (data: any) => {
      if (data?.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      }
    },
    onError: (error) => {
      console.log("error", error?.message);
    },
  });
};
