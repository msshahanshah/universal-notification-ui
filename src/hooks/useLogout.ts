import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { useSnackbar } from "src/provider/snackbar";
import api from "src/lib/axios";

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post("/logout");
      return response.data;
    },
    onSuccess: (data) => {
      // Clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("clientId");
      
      // Clear all React Query cache
      queryClient.clear();
      
      // Show success message
      showSnackbar("Logged out successfully", "success");
      
      // Redirect to login page
      navigate("/");
    },
    onError: (error: any) => {
      console.error("Logout error:", error);
      
      // Even if API fails, clear local storage and redirect
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("clientId");
      
      // Clear cache
      queryClient.clear();
      
      // Show error message but still redirect
      showSnackbar("Logout completed with warnings", "warning");
      navigate("/");
    },
  });
};
