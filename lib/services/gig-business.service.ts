import gigAPIService from "./gig-api.service";
import gigAuthService from "./gig-auth.service";
import {
  GIGCompanyInfoResponse,
  GIGInvoiceGenerateRequest,
  GIGInvoiceGenerateResponse,
  GIGWalletChargeRequest,
  GIGWalletChargeResponse,
} from "../types/gig-logistics";
import { GIG_ENDPOINTS } from "../const";

class GIGBusinessService {
  async getCompanyInfo(email: string): Promise<GIGCompanyInfoResponse> {
    try {
      if (!gigAuthService.isAuthenticated()) {
        await gigAuthService.autoLogin();
      }

      const response = await gigAPIService
        .getClient()
        .get<GIGCompanyInfoResponse>(GIG_ENDPOINTS.company.get_company_info, {
          params: { Email: email },
        });

      return response.data;
    } catch (error) {
      console.error("[GIG Business] Failed to get company info:", error);
      throw error;
    }
  }

  async chargeWallet(
    payload: GIGWalletChargeRequest,
  ): Promise<GIGWalletChargeResponse> {
    try {
      if (!gigAuthService.isAuthenticated()) {
        await gigAuthService.autoLogin();
      }

      const response = await gigAPIService
        .getClient()
        .put<GIGWalletChargeResponse>(
          GIG_ENDPOINTS.wallet.marchant_wallet,
          payload,
        );

      return response.data;
    } catch (error) {
      console.error("[GIG Business] Failed to charge wallet:", error);
      throw error;
    }
  }

  async generateInvoice(
    payload: GIGInvoiceGenerateRequest,
  ): Promise<GIGInvoiceGenerateResponse> {
    try {
      if (!gigAuthService.isAuthenticated()) {
        await gigAuthService.autoLogin();
      }

      const response = await gigAPIService
        .getClient()
        .post<GIGInvoiceGenerateResponse>(
          GIG_ENDPOINTS.invoice.generate,
          payload,
        );

      return response.data;
    } catch (error) {
      console.error("[GIG Business] Failed to generate invoice:", error);
      throw error;
    }
  }
}

export default new GIGBusinessService();
