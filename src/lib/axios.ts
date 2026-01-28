import axios from "axios";
import { fetchRefreshToken } from "src/api/login.api";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const getRefreshToken = async (originalRequest: any) => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    localStorage.clear();
    window.location.href = "/";
    return;
  }
  const refreshTokenData = await fetchRefreshToken({ refreshToken });

  localStorage.setItem("accessToken", refreshTokenData?.data?.accessToken);
  if (refreshTokenData?.data?.accessToken) {
    api.defaults.headers.Authorization = `Bearer ${refreshTokenData?.data?.accessToken}`;
    originalRequest.headers["Authorization"] =
      `Bearer ${refreshTokenData?.data?.accessToken}`;
  }

  processQueue(null, refreshTokenData?.data?.accessToken);

  return api(originalRequest);
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    config.headers["X-Client-Id"] = "GKMIT";
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response) => response, // return only data
  async (error) => {
    const originalRequest = error.config;
    if (originalRequest.url?.includes("/login")) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && originalRequest?.url === "/refresh") {
      localStorage.clear();
      window.location.href = "/";
      return;
    }
    // Centralized error handling
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("error.response?.status", error.response?.status);
      if (isRefreshing) {
        // Queue request until refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      await getRefreshToken(originalRequest);
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  },
);

export default api;
