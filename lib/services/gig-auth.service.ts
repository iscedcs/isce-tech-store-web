import axios, { AxiosError } from "axios";
import {
  GIGLoginRequest,
  GIGLoginResponse,
  GIGAPIError,
} from "../types/gig-logistics";

const GIG_LOGIN_URL =
  process.env.NEXT_PUBLIC_GIG_LOGIN_URL ||
  "https://dev-thirdpartynode.theagilitysystems.com/login";

/**
 * GIG Authentication Service
 * Handles login and token management for GIG Logistics API
 */
class GIGAuthService {
  private accessToken: string | null = null;
  private tokenExpiresAt: number | null = null;
  private userChannelCode: string | null = null;

  /**
   * Login to GIG Logistics and retrieve access token
   */
  async login(credentials: GIGLoginRequest): Promise<GIGLoginResponse> {
    try {
      const response = await axios.post<GIGLoginResponse>(
        GIG_LOGIN_URL,
        credentials,
        {
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
          timeout: 10000,
        },
      );

      if (response.data.status === 200 && response.data.data["access-token"]) {
        this.accessToken = response.data.data["access-token"];
        this.userChannelCode = response.data.data.UserChannelCode || null;
        this.tokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Store token in localStorage for persistence (only in browser)
        if (typeof window !== "undefined") {
          localStorage.setItem("gig_access_token", this.accessToken);
          localStorage.setItem(
            "gig_token_expires_at",
            this.tokenExpiresAt.toString(),
          );
          if (this.userChannelCode) {
            localStorage.setItem("gig_channel_code", this.userChannelCode);
          }
        }

        console.log(
          "[GIG Auth] Login successful, channel code:",
          this.userChannelCode,
        );
      }

      return response.data;
    } catch (error) {
      console.error("[GIG Auth] Login failed:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    // Check if token is still valid
    if (this.tokenExpiresAt && Date.now() > this.tokenExpiresAt) {
      this.accessToken = null;
      this.tokenExpiresAt = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("gig_access_token");
        localStorage.removeItem("gig_token_expires_at");
      }
      return null;
    }

    if (this.accessToken) {
      return this.accessToken;
    }

    // Try to retrieve from localStorage
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("gig_access_token");
      const savedExpiry = localStorage.getItem("gig_token_expires_at");
      const savedChannelCode = localStorage.getItem("gig_channel_code");

      if (savedToken && savedExpiry) {
        const expiresAt = parseInt(savedExpiry, 10);
        if (Date.now() < expiresAt) {
          this.accessToken = savedToken;
          this.tokenExpiresAt = expiresAt;
          if (savedChannelCode) {
            this.userChannelCode = savedChannelCode;
          }
          return this.accessToken;
        } else {
          // Token has expired
          localStorage.removeItem("gig_access_token");
          localStorage.removeItem("gig_token_expires_at");
          localStorage.removeItem("gig_channel_code");
        }
      }
    }

    return null;
  }

  /**
   * Check if token exists and is valid
   */
  isTokenValid(): boolean {
    const token = this.getAccessToken();
    return (
      !!token && (!this.tokenExpiresAt || Date.now() < this.tokenExpiresAt)
    );
  }

  /**
   * Clear access token on logout
   */
  logout(): void {
    this.accessToken = null;
    this.tokenExpiresAt = null;
    this.userChannelCode = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("gig_access_token");
      localStorage.removeItem("gig_token_expires_at");
      localStorage.removeItem("gig_channel_code");
    }
    console.log("[GIG Auth] Logged out");
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isTokenValid();
  }

  /**
   * Get the merchant/customer channel code from login response
   */
  getUserChannelCode(): string | null {
    if (this.userChannelCode) return this.userChannelCode;
    // Try localStorage fallback
    if (typeof window !== "undefined") {
      return localStorage.getItem("gig_channel_code");
    }
    return null;
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): GIGAPIError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<GIGAPIError>;

      if (axiosError.response?.data) {
        return axiosError.response.data;
      }

      return {
        message: axiosError.message || "Authentication failed",
        status: axiosError.response?.status || 500,
        apiId: "",
        errors: [axiosError.message],
      };
    }

    return {
      message: "An unexpected error occurred",
      status: 500,
      apiId: "",
      errors: [String(error)],
    };
  }

  /**
   * Auto-login using environment credentials
   */
  async autoLogin(): Promise<boolean> {
    // If token is already valid, return true
    if (this.isAuthenticated()) {
      return true;
    }

    const email = process.env.GIG_EMAIL;
    const password = process.env.GIG_PASSWORD;

    if (!email || !password) {
      console.error(
        "[GIG Auth] Missing GIG_EMAIL or GIG_PASSWORD in environment variables",
      );
      return false;
    }

    try {
      await this.login({ email, password });
      return this.isAuthenticated();
    } catch (error) {
      console.error("[GIG Auth] Auto-login failed:", error);
      return false;
    }
  }
}

export default new GIGAuthService();
