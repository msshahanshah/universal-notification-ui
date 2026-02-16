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
    config.headers["ngrok-skip-browser-warning"] = "true";
    const token = localStorage.getItem("accessToken");
    if (token && !config?.url?.includes("amazonaws.com"))
      config.headers.Authorization = `Bearer ${token}`;
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest)); // UI waits for retry
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          const response = await getRefreshToken(originalRequest);
          isRefreshing = false;
          resolve(response); // only success reaches UI
        } catch (err) {
          isRefreshing = false;
          processQueue(err, null);
          reject(err); // now toast is valid
        }
      });
    }
  },
);

export default api;
