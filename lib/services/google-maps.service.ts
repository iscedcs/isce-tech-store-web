/**
 * Google Maps Service
 * Handles address autocomplete, geocoding, and location lookup
 */

export interface GoogleMapsPlace {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText?: string;
  latitude?: number;
  longitude?: number;
}

export interface GoogleMapsLocation {
  latitude: number;
  longitude: number;
  address: string;
  state?: string;
  stateId?: number;
  placeId?: string;
}

class GoogleMapsService {
  private apiKey: string;
  private readonly BASE_URL = "https://maps.googleapis.com/maps/api";

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  }

  /**
   * Autocomplete address search
   * Returns list of places matching the input
   */
  async searchPlaces(input: string): Promise<GoogleMapsPlace[]> {
    if (!this.apiKey) {
      console.error("[Google Maps] API key not configured");
      return [];
    }

    if (!input || input.trim().length < 2) {
      return [];
    }

    try {
      // Using the Autocomplete service
      const url = `${this.BASE_URL}/place/autocomplete/json`;
      const params = new URLSearchParams({
        input,
        key: this.apiKey,
        language: "en",
        // Note: components restriction removed to test if that's blocking results
        // Restricted to Nigeria to show Nigerian locations first
      });

      const fullUrl = `${url}?${params.toString()}`;
      console.log("[Google Maps] Searching for:", input);
      console.log("[Google Maps] Full URL (without key):", url);

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      console.log("[Google Maps] Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Google Maps] HTTP Error:", response.status, errorText);
        return [];
      }

      const data = await response.json();

      console.log(
        "[Google Maps] Full API response:",
        JSON.stringify(data, null, 2),
      );

      if (
        data.status &&
        data.status !== "OK" &&
        data.status !== "ZERO_RESULTS"
      ) {
        console.error("[Google Maps] API error status:", data.status);
        if (data.error_message) {
          console.error("Error message:", data.error_message);
        }
        return [];
      }

      if (data.predictions && data.predictions.length > 0) {
        const results = data.predictions.map((prediction: any) => ({
          placeId: prediction.place_id,
          description: prediction.description,
          mainText:
            prediction.structured_formatting?.main_text ||
            prediction.description,
          secondaryText: prediction.structured_formatting?.secondary_text,
        }));
        console.log("[Google Maps] Returning results:", results);
        return results;
      }

      console.log("[Google Maps] No predictions found");
      return [];
    } catch (error) {
      console.error("[Google Maps] Search error:", error);
      return [];
    }
  }

  /**
   * Get place details including coordinates
   */
  async getPlaceDetails(placeId: string): Promise<GoogleMapsLocation | null> {
    if (!this.apiKey) {
      console.error("[Google Maps] API key not configured");
      return null;
    }

    try {
      const url = `${this.BASE_URL}/place/details/json`;
      const params = new URLSearchParams({
        place_id: placeId,
        fields: "formatted_address,geometry,address_components",
        key: this.apiKey,
      });

      const response = await fetch(`${url}?${params.toString()}`);

      if (!response.ok) {
        console.error(
          "[Google Maps] Place details failed:",
          response.statusText,
        );
        return null;
      }

      const data = await response.json();

      if (data.result) {
        const location = data.result.geometry?.location;
        const address_components = data.result.address_components || [];

        // Extract state from address components
        const stateComponent = address_components.find((component: any) =>
          component.types.includes("administrative_area_level_1"),
        );
        const stateName = stateComponent?.long_name || "";

        return {
          latitude: location?.lat || 0,
          longitude: location?.lng || 0,
          address: data.result.formatted_address || "",
          state: stateName,
          placeId,
        };
      }

      return null;
    } catch (error) {
      console.error("[Google Maps] Get details error:", error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(
    latitude: number,
    longitude: number,
  ): Promise<GoogleMapsLocation | null> {
    if (!this.apiKey) {
      console.error("[Google Maps] API key not configured");
      return null;
    }

    try {
      const url = `${this.BASE_URL}/geocode/json`;
      const params = new URLSearchParams({
        latlng: `${latitude},${longitude}`,
        key: this.apiKey,
      });

      const response = await fetch(`${url}?${params.toString()}`);

      if (!response.ok) {
        console.error(
          "[Google Maps] Reverse geocode failed:",
          response.statusText,
        );
        return null;
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const address_components = result.address_components || [];

        // Extract state
        const stateComponent = address_components.find((component: any) =>
          component.types.includes("administrative_area_level_1"),
        );
        const stateName = stateComponent?.long_name || "";

        return {
          latitude,
          longitude,
          address: result.formatted_address || "",
          state: stateName,
        };
      }

      return null;
    } catch (error) {
      console.error("[Google Maps] Reverse geocode error:", error);
      return null;
    }
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export default new GoogleMapsService();
