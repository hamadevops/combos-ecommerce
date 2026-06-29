import { client } from "@projects/shared";
import { auth } from "@/lib/auth";

// Generated SDK urls already include '/api/v1', so base url should be root.
const envUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3333";
const BASE_URL = envUrl.replace(/\/api\/v1\/?$/, "");

// Configure base URL
client.setConfig({
  baseUrl: BASE_URL,
});

// Add request interceptor for Authentication
client.interceptors.request.use((request, options) => {
  const token = auth.getToken();
  if (token) {
    request.headers.set("Authorization", `Bearer ${token}`);
  }
  return request;
});

// Add response interceptor to handle errors and 401
client.interceptors.response.use(async (response, request, options) => {
  if (response.status === 401) {
    const currentPath = window.location.pathname;
    // Prevent redirect loop if already on login page
    if (currentPath !== "/login") {
      auth.clear();
      window.location.href = "/login";
    }
  }
  return response;
});

// Error interceptor not strictly needed if we adhere to fetch reject on network error,
// but for status codes, fetch resolves (response.ok is false).
// The generated client throws if `throwOnError` is true (default false usually unless specified options).
// However, the client wrapper returns { data, error, response } usually.
// Let's check how we want to handle errors.
// The existing `apiClient` returns `response.data` or rejects with `ApiError`.
// The generated functions return `{ data, error, response }`.
// If we want to throw on error to match existing behavior, we might need a wrapper or use `throwOnError`.
