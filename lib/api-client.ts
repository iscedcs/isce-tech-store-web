import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { AUTH_API, baseUrl } from "./const";

// Default timeout of 5 seconds
const DEFAULT_TIMEOUT = 5000;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Create axios instance for auth API
const createApiClient = (baseURL?: string): AxiosInstance => {
  const client = axios.create({
    baseURL: baseURL,
    timeout: DEFAULT_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // You can add auth token here if needed
      // const token = getAuthToken();
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      const apiError: ApiError = {
        message: "An unexpected error occurred",
        status: error.response?.status,
        code: error.code,
      };

      if (error.code === "ECONNABORTED") {
        apiError.message = "Request timeout. Please try again.";
      } else if (error.code === "ERR_NETWORK") {
        apiError.message = "Network error. Please check your connection.";
      } else if (error.response) {
        // Server responded with error
        const responseData = error.response.data as Record<string, unknown>;
        apiError.message =
          (responseData?.message as string) ||
          (responseData?.error as string) ||
          `Server error: ${error.response.status}`;
      }

      return Promise.reject(apiError);
    }
  );

  return client;
};

// Auth API client
export const authApiClient = createApiClient(AUTH_API);

// Base API client (for other endpoints)
export const apiClient = createApiClient(baseUrl);

// Generic request wrapper with error handling
export const apiRequest = async <T>(
  request: () => Promise<AxiosResponse<T>>
): Promise<ApiResponse<T>> => {
  try {
    const response = await request();
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const apiError = error as ApiError;
    return {
      success: false,
      error: apiError.message,
    };
  }
};

// Auth API wrapper functions
export const authApi = {
  post: <T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ) => apiRequest<T>(() => authApiClient.post(url, data, config)),

  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>(() => authApiClient.get(url, config)),

  put: <T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ) => apiRequest<T>(() => authApiClient.put(url, data, config)),

  patch: <T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ) => apiRequest<T>(() => authApiClient.patch(url, data, config)),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>(() => authApiClient.delete(url, config)),
};

// General API wrapper functions
export const api = {
  post: <T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ) => apiRequest<T>(() => apiClient.post(url, data, config)),

  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>(() => apiClient.get(url, config)),

  put: <T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ) => apiRequest<T>(() => apiClient.put(url, data, config)),

  patch: <T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ) => apiRequest<T>(() => apiClient.patch(url, data, config)),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>(() => apiClient.delete(url, config)),
};
