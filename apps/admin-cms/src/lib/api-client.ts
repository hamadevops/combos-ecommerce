import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { auth } from "./auth";

// Define the standard API Response structure
export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
  timestamp?: string;
  path?: string;
}

// Error Interface
export interface ApiError {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  errors?: Record<string, any>;
}

// Configuration
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3333/api/v1";

import qs from "qs";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: "repeat" });
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = auth.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data; // Return the data directly if adhering to ApiResponse
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (window.location.pathname !== "/login") {
        auth.clear();
        window.location.href = "/login";
      }
    }

    // Standardize error format
    const apiError: ApiError = {
      statusCode: error.response?.status || 500,
      message: (error.response?.data as any)?.message || error.message || "Internal Server Error",
      timestamp: new Date().toISOString(),
      path: window.location.pathname,
      errors: (error.response?.data as any)?.errors,
    };

    return Promise.reject(apiError);
  },
);

// Generic Wrapper for Typed Requests
export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get<ApiResponse<T>, T>(url, config),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.post<ApiResponse<T>, T>(url, data, config),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.put<ApiResponse<T>, T>(url, data, config),

  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    axiosInstance.patch<ApiResponse<T>, T>(url, data, config),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.delete<ApiResponse<T>, T>(url, config),
};

export default axiosInstance;
