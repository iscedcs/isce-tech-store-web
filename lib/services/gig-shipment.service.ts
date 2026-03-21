import gigAPIService from "./gig-api.service";
import gigAuthService from "./gig-auth.service";
import {
  GIGShipmentTrackingRequest,
  GIGShipmentResponse,
  GIGAPIError,
  GIGStation,
  GIGStationsResponse,
  GIGPickupLocation,
  GIGPickupLocationsResponse,
  GIGHomeDeliveryResponse,
  GIGPriceRequest,
  GIGPriceResponse,
  GIGBulkPriceRequest,
  GIGBulkPriceResponse,
  GIGCreateShipmentRequest,
  GIGTrackingResponse,
  GIGMultiTrackResponse,
} from "../types/gig-logistics";
import { GIG_ENDPOINTS } from "../const";

/**
 * GIG Shipment Service
 * Handles all shipment-related operations with GIG Logistics API
 */
class GIGShipmentService {
  private stationsCache: GIGStation[] | null = null;
  private stationsCacheTime: number | null = null;
  private CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Get all Nigerian stations
   * Results are cached for 24 hours
   */
  async getStations(): Promise<GIGStation[]> {
    // Return cached result if still valid
    if (
      this.stationsCache &&
      this.stationsCacheTime &&
      Date.now() - this.stationsCacheTime < this.CACHE_DURATION_MS
    ) {
      console.log("[GIG] Returning cached stations");
      return this.stationsCache;
    }

    try {
      // Ensure authentication
      if (!gigAuthService.isAuthenticated()) {
        await gigAuthService.autoLogin();
      }

      const response = await gigAPIService
        .getClient()
        .get<GIGStationsResponse>(
          GIG_ENDPOINTS.geographical.all_local_stations,
        );

      if (response.data.status === 200 && response.data.data) {
        this.stationsCache = response.data.data;
        this.stationsCacheTime = Date.now();
        console.log(`[GIG] Loaded ${this.stationsCache.length} stations`);
      }

      return response.data.data || [];
    } catch (error) {
      console.error("[GIG] Failed to get stations:", error);
      throw this.handleServiceError(error);
    }
  }

  /**
   * Clear stations cache (useful after updates)
   */
  clearStationsCache(): void {
    this.stationsCache = null;
    this.stationsCacheTime = null;
    console.log("[GIG] Stations cache cleared");
  }

  /**
   * Get pickup locations for a specific station
   */
  async getPickupLocations(stationId: number): Promise<GIGPickupLocation[]> {
    try {
      if (!gigAuthService.isAuthenticated()) {
        await gigAuthService.autoLogin();
      }

      const response = await gigAPIService
        .getClient()
        .get<GIGPickupLocationsResponse>(
          GIG_ENDPOINTS.geographical.get_pickup_locations,
          {
            params: { StationId: stationId },
          },
        );

      if (response.data.status === 200 && response.data.data) {
        console.log(
          `[GIG] Loaded ${response.data.data.length} pickup locations for station ${stationId}`,
        );
      }

      return response.data.data || [];
    } catch (error) {
      console.error("[GIG] Failed to get pickup locations:", error);
      throw this.handleServiceError(error);
    }
  }

  /**
   * Get home delivery areas for a state
   */
  async getHomeDeliveryAreas(
    stateId: number,
    search?: string,
    limit: number = 50,
    skip: number = 0,
  ): Promise<any[]> {
    try {
      if (!gigAuthService.isAuthenticated()) {
        await gigAuthService.autoLogin();
      }

      const params: any = {
        StateId: stateId,
        Limit: limit,
        Skip: skip,
      };

      if (search) {
        params.Search = search;
      }

      try {
        const response = await gigAPIService
          .getClient()
          .get<GIGHomeDeliveryResponse>(
            GIG_ENDPOINTS.geographical.home_delivery,
            { params },
          );

        if (response.data.status === 200 && response.data.data) {
          console.log(
            `[GIG] Found ${response.data.data.length} home delivery areas for state ${stateId}`,
          );
          return response.data.data || [];
        }
      } catch (apiError: any) {
        // If the endpoint returns 404 or the endpoint doesn't exist, return empty array
        // The user can use address search as fallback
        if (
          apiError?.response?.status === 404 ||
          (apiError?.message && apiError.message.includes("Cannot GET"))
        ) {
          console.warn(
            "[GIG] Home delivery areas endpoint not available, using address search as fallback",
          );
          return [];
        }
        throw apiError;
      }

      return [];
    } catch (error) {
      console.error("[GIG] Failed to get home delivery areas:", error);
      throw this.handleServiceError(error);
    }
  }

  /**
   * Calculate shipping price for a shipment
   */
  async calculateShippingPrice(
    request: GIGPriceRequest,
  ): Promise<number | null> {
    try {
      if (!gigAuthService.isAuthenticated()) {
        await gigAuthService.autoLogin();
      }

      const response = await gigAPIService
        .getClient()
        .post<GIGPriceResponse>(GIG_ENDPOINTS.price.shipment, request);

      if (response.data.status === 200) {
        const data = response.data.data;

        // Handle both single response and array response
        if (Array.isArray(data)) {
          // Extract DeliveryPrice from response
          return data[0]?.DeliveryPrice || data[0]?.Amount || 0;
        } else {
          // Extract DeliveryPrice from response (primary), fallback to Amount
          return data?.DeliveryPrice || data?.Amount || 0;
        }
      }

      return null;
    } catch (error) {
      console.error("[GIG] Failed to calculate shipping price:", error);
      throw this.handleServiceError(error);
    }
  }

  /**
   * Calculate bulk shipping price for multiple distinct products
   */
  async calculateBulkShippingPrice(
    request: GIGBulkPriceRequest,
  ): Promise<number | null> {
    try {
      if (!gigAuthService.isAuthenticated()) {
        await gigAuthService.autoLogin();
      }

      const response = await gigAPIService
        .getClient()
        .post<GIGBulkPriceResponse>(GIG_ENDPOINTS.price.bulk_shipment, request);

      if (response.data.status === 200 && response.data.data) {
        const prices = response.data.data;
        // Sum all GrandTotal values from the bulk response
        const totalPrice = prices.reduce((sum, item) => {
          return sum + (item?.GrandTotal || item?.DeliverPrice || 0);
        }, 0);
        return totalPrice;
      }

      return null;
    } catch (error) {
      console.error("[GIG] Failed to calculate bulk shipping price:", error);
      throw this.handleServiceError(error);
    }
  }

  /**
   * Create a new shipment with GIG Logistics
   */
  async createShipment(request: GIGCreateShipmentRequest): Promise<any> {
    try {
      if (!gigAuthService.isAuthenticated()) {
        await gigAuthService.autoLogin();
      }

      const endpoint = GIG_ENDPOINTS.shipment.create;

      const response = await gigAPIService
        .getClient()
        .post<GIGShipmentResponse>(endpoint, request);

      if (response.data.status === 200) {
        const data = response.data.data;
        console.log(
          `[GIG] Shipment created:`,
          Array.isArray(data) ? data[0] : data,
        );
      }

      return response.data.data;
    } catch (error) {
      console.error("[GIG] Failed to create shipment:", error);
      throw this.handleServiceError(error);
    }
  }

  /**
   * Track a single shipment by ID or waybill
   */
  async trackShipment(
    shipmentId: string,
    waybill?: string,
  ): Promise<GIGShipmentResponse> {
    try {
      if (!gigAuthService.isAuthenticated()) {
        await gigAuthService.autoLogin();
      }

      const payload: GIGShipmentTrackingRequest = {
        shipmentId,
        ...(waybill && { waybill }),
      };

      const response = await gigAPIService
        .getClient()
        .post<GIGShipmentResponse>(GIG_ENDPOINTS.shipment.track, payload);

      return response.data;
    } catch (error) {
      console.error("[GIG] Failed to track shipment:", error);
      throw this.handleServiceError(error);
    }
  }

  /**
   * Track by waybill number only
   * GET /track/mobileShipment?Waybill=...
   * Returns same structure as multi-track: data[].MobileShipmentTrackings[]
   */
  async trackByWaybill(waybill: string): Promise<GIGMultiTrackResponse> {
    try {
      if (!gigAuthService.isAuthenticated()) {
        await gigAuthService.autoLogin();
      }

      const response = await gigAPIService
        .getClient()
        .get<GIGMultiTrackResponse>(GIG_ENDPOINTS.shipment.track, {
          params: { Waybill: waybill },
        });

      return response.data;
    } catch (error) {
      console.error("[GIG] Failed to track by waybill number:", error);
      throw this.handleServiceError(error);
    }
  }

  /**
   * Track multiple shipments at once
   * POST /track/multipleMobileShipment
   * Body: { Waybill: ["...", "..."] }
   */
  async trackMultipleShipments(
    waybills: string[],
  ): Promise<GIGMultiTrackResponse> {
    try {
      if (!gigAuthService.isAuthenticated()) {
        await gigAuthService.autoLogin();
      }

      const response = await gigAPIService
        .getClient()
        .post<GIGMultiTrackResponse>(GIG_ENDPOINTS.shipment.track_multiple, {
          Waybill: waybills,
        });

      return response.data;
    } catch (error) {
      console.error("[GIG] Failed to track multiple shipments:", error);
      throw this.handleServiceError(error);
    }
  }

  /**
   * Get detailed shipment information
   */
  async getShipmentDetails(shipmentId: string): Promise<GIGShipmentResponse> {
    try {
      if (!gigAuthService.isAuthenticated()) {
        await gigAuthService.autoLogin();
      }

      const response = await gigAPIService
        .getClient()
        .get<GIGShipmentResponse>(
          `${GIG_ENDPOINTS.shipment.get_shipment_details}/${shipmentId}`,
        );

      return response.data;
    } catch (error) {
      console.error("[GIG] Failed to get shipment details:", error);
      throw this.handleServiceError(error);
    }
  }

  /**
   * Get pre-shipment details (before shipment is sent)
   */
  async getPreshipmentDetails(
    shipmentId: string,
  ): Promise<GIGShipmentResponse> {
    try {
      if (!gigAuthService.isAuthenticated()) {
        await gigAuthService.autoLogin();
      }

      const response = await gigAPIService
        .getClient()
        .get<GIGShipmentResponse>(
          `${GIG_ENDPOINTS.shipment.get_shipment_details}/${shipmentId}`,
        );

      return response.data;
    } catch (error) {
      console.error("[GIG] Failed to get pre-shipment details:", error);
      throw this.handleServiceError(error);
    }
  }

  /**
   * Get pre-shipment mobile details by waybill number
   */
  async getPreshipmentByWaybill(waybill: string): Promise<any> {
    try {
      if (!gigAuthService.isAuthenticated()) {
        await gigAuthService.autoLogin();
      }

      const response = await gigAPIService
        .getClient()
        .get<any>(GIG_ENDPOINTS.shipment.get_shipment_details, {
          params: { Waybill: waybill },
        });

      return response.data;
    } catch (error) {
      console.error("[GIG] Failed to get pre-shipment details:", error);
      throw this.handleServiceError(error);
    }
  }

  /**
   * Create bulk shipments with GIG Logistics.
   * Sends { Shipments: [...] } where each entry has flat sender/receiver fields.
   */
  async createBulkShipment(shipments: any[]): Promise<any> {
    try {
      if (!gigAuthService.isAuthenticated()) {
        await gigAuthService.autoLogin();
      }

      const payload = { Shipments: shipments };

      const response = await gigAPIService
        .getClient()
        .post<any>(GIG_ENDPOINTS.shipment.create_bulk_shipment, payload);

      console.log(
        "[GIG] Bulk shipment response:",
        JSON.stringify(response.data, null, 2),
      );
      return response.data;
    } catch (error) {
      console.error("[GIG] Failed to create bulk shipments:", error);
      throw this.handleServiceError(error);
    }
  }

  /**
   * Generate invoice for a shipment or group of shipments
   */
  async generateInvoice(request: any): Promise<any> {
    try {
      if (!gigAuthService.isAuthenticated()) {
        await gigAuthService.autoLogin();
      }

      const response = await gigAPIService
        .getClient()
        .post<any>(GIG_ENDPOINTS.invoice.generate, request);

      return response.data;
    } catch (error) {
      console.error("[GIG] Failed to generate invoice:", error);
      throw this.handleServiceError(error);
    }
  }

  /**
   * Check merchant wallet balance
   */
  async getWalletBalance(): Promise<any> {
    try {
      if (!gigAuthService.isAuthenticated()) {
        await gigAuthService.autoLogin();
      }

      const response = await gigAPIService
        .getClient()
        .get<any>(GIG_ENDPOINTS.wallet.marchant_wallet);

      return response.data;
    } catch (error) {
      console.error("[GIG] Failed to get wallet balance:", error);
      throw this.handleServiceError(error);
    }
  }

  /**
   * Handle service-level errors
   */
  private handleServiceError(error: any): GIGAPIError {
    if (error.data) {
      return error.data;
    }

    if (error.message) {
      return {
        message: error.message,
        status: error.status || 500,
        apiId: error.apiId || "",
        errors: [error.message],
      };
    }

    return {
      message: "Failed to process shipment request",
      status: 500,
      apiId: "",
      errors: [String(error)],
    };
  }
}

export default new GIGShipmentService();
