"use server";

export async function searchPlacesAction(input: string): Promise<any[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("[Google Maps Server] API key not configured");
      return [];
    }

    if (!input || input.trim().length < 2) {
      return [];
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json`;
    const params = new URLSearchParams({
      input,
      key: apiKey,
      components: "country:ng",
      language: "en",
    });

    console.log("[Google Maps Server] Searching for:", input);

    const response = await fetch(`${url}?${params.toString()}`);

    if (!response.ok) {
      console.error(
        "[Google Maps Server] API error:",
        response.status,
        response.statusText,
      );
      return [];
    }

    const data = await response.json();

    console.log("[Google Maps Server] API Response:", data);

    if (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("[Google Maps Server] API status error:", data.status);
      if (data.error_message) {
        console.error("Error message:", data.error_message);
      }
      return [];
    }

    if (data.predictions && data.predictions.length > 0) {
      return data.predictions.map((prediction: any) => ({
        placeId: prediction.place_id,
        description: prediction.description,
        mainText:
          prediction.structured_formatting?.main_text || prediction.description,
        secondaryText: prediction.structured_formatting?.secondary_text,
      }));
    }

    console.log("[Google Maps Server] No predictions found");
    return [];
  } catch (error) {
    console.error("[Google Maps Server] Search error:", error);
    return [];
  }
}

export async function getPlaceDetailsAction(placeId: string): Promise<{
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
} | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("[Google Maps Server] API key not configured");
      return null;
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json`;
    const params = new URLSearchParams({
      place_id: placeId,
      key: apiKey,
      fields: "formatted_address,geometry,address_components",
    });

    console.log("[Google Maps Server] Getting place details for:", placeId);

    const response = await fetch(`${url}?${params.toString()}`);

    if (!response.ok) {
      console.error(
        "[Google Maps Server] Details API error:",
        response.status,
        response.statusText,
      );
      return null;
    }

    const data = await response.json();

    console.log("[Google Maps Server] Place details response:", data);

    if (data.result) {
      const location = data.result.geometry?.location;
      const address_components = data.result.address_components || [];

      // Extract state from address components
      const stateComponent = address_components.find((component: any) =>
        component.types.includes("administrative_area_level_1"),
      );
      const stateName = stateComponent?.long_name || "";

      // Extract city from address components
      const cityComponent = address_components.find((component: any) =>
        component.types.includes("locality"),
      );
      const cityName = cityComponent?.long_name || stateName;

      return {
        address: data.result.formatted_address || "",
        city: cityName,
        state: stateName,
        latitude: location?.lat || 0,
        longitude: location?.lng || 0,
      };
    }

    console.log("[Google Maps Server] No result found");
    return null;
  } catch (error) {
    console.error("[Google Maps Server] Get details error:", error);
    return null;
  }
}
