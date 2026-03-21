import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";
import gigAuthService from "./gig-auth.service";
import { GIGAPIError } from "../types/gig-logistics";

const GIG_BASE_URL =
  process.env.NEXT_PUBLIC_GIG_BASE_URL ||
  "https://dev-thirdpartynode.theagilitysystems.com";

/**
 * GIG API Service
 * Provides a configured axios instance with interceptors for GIG Logistics API
 */
class GIGAPIService {
  private client: AxiosInstance;
  private isInitialized = false;

  constructor() {
    this.client = axios.create({
      baseURL: GIG_BASE_URL,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      timeout: 10000, // 10 seconds
    });

    this.setupInterceptors();
    this.isInitialized = true;
  }

  /**
   * Setup axios interceptors for request/response handling
   */
  private setupInterceptors(): void {
    // Request interceptor: Add authorization token
    this.client.interceptors.request.use(
      (config) => {
        const token = gigAuthService.getAccessToken();
        if (token) {
          config.headers["access-token"] = token;
        }
        return config;
      },
      (error) => {
        console.error("[GIG API] Request error:", error.message);
        return Promise.reject(error);
      },
    );

    // Response interceptor: Handle errors
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        return this.handleResponseError(error);
      },
    );
  }

  /**
   * Get axios instance for direct use if needed
   */
  getClient(): AxiosInstance {
    return this.client;
  }

  /**
   * Make a GET request
   */
  async get<T>(url: string, config?: any): Promise<AxiosResponse<T>> {
    try {
      return await this.client.get<T>(url, config);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a POST request
   */
  async post<T>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.client.post<T>(url, data, config);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a PUT request
   */
  async put<T>(
    url: string,
    data?: any,
    config?: any,
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.client.put<T>(url, data, config);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(url: string, config?: any): Promise<AxiosResponse<T>> {
    try {
      return await this.client.delete<T>(url, config);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors with proper status codes
   */
  private handleError(error: any): GIGAPIError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<GIGAPIError>;
      const status = axiosError.response?.status;
      const data = axiosError.response?.data;

      // Handle specific status codes
      if (status === 400) {
        console.warn(
          "[GIG API] Bad Request:",
          data?.message || "Invalid request parameters",
        );
      } else if (status === 401) {
        console.warn(
          "[GIG API] Unauthorized:",
          data?.message || "Authentication failed",
        );
        // Clear token on 401
        gigAuthService.logout();
      } else if (status === 500) {
        console.error(
          "[GIG API] Server Error:",
          data?.message || "Internal server error",
        );
      } else if (status === 0 || !status) {
        console.error("[GIG API] Network Error:", axiosError.message);
      }

      return (
        data || {
          message: axiosError.message || "API request failed",
          status: status || 0,
          apiId: "",
          errors: [axiosError.message],
        }
      );
    }

    // Non-axios error
    return {
      message: String(error) || "Unknown error",
      status: 0,
      apiId: "",
      errors: [String(error)],
    };
  }

  /**
   * Handle response-level errors
   */
  private handleResponseError(error: AxiosError): Promise<never> {
    return Promise.reject(this.handleError(error));
  }

  /**
   * Check if service is ready to use
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

export default new GIGAPIService();
