"use client";

import { Input } from "@/components/ui/input";
import { useLoadScript } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

const libraries: "places"[] = ["places"];

interface LocationSearchProps {
  onLocationSelect: (location: {
    address: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  }) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  placeholder = "Search for your delivery address",
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<
    { placeId: string; description: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const requestRef = useRef(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  useEffect(() => {
    if (isLoaded && window.google) {
      sessionTokenRef.current =
        new google.maps.places.AutocompleteSessionToken();
    }
  }, [isLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearch = async () => {
    if (!isLoaded || inputValue.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    const currentRequest = ++requestRef.current;

    try {
      const request = {
        input: inputValue,
        componentRestrictions: { country: "ng" },
        sessionToken: sessionTokenRef.current || undefined,
      };

      const service = new google.maps.places.AutocompleteService();
      const result = await service.getPlacePredictions(request);

      if (currentRequest !== requestRef.current) return;

      if (result.predictions && result.predictions.length > 0) {
        setSuggestions(
          result.predictions.map((prediction) => ({
            placeId: prediction.place_id,
            description: prediction.description,
          })),
        );
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
      setLoading(false);
    } catch (error) {
      console.error("[LocationSearch] Error:", error);
      setSuggestions([]);
      setLoading(false);
    }
  };

  const handleSelect = async (prediction: {
    placeId: string;
    description: string;
  }) => {
    const placeId = prediction.placeId;
    setInputValue(prediction.description);
    setSuggestions([]);
    setShowSuggestions(false);

    try {
      const request = {
        placeId,
        fields: ["address_components", "geometry", "formatted_address"],
        sessionToken: sessionTokenRef.current || undefined,
      };

      const service = new google.maps.places.PlacesService(
        document.createElement("div"),
      );

      service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const comps = place.address_components || [];

          const get = (type: string) =>
            comps.find((c) => c.types.includes(type))?.long_name || "";

          const structured = {
            city: get("locality") || get("sublocality") || "",
            state: get("administrative_area_level_1") || "",
          };

          onLocationSelect({
            address: prediction.description,
            city: structured.city,
            state: structured.state,
            latitude: place.geometry?.location?.lat() || 6.5244,
            longitude: place.geometry?.location?.lng() || 3.3792,
          });

          // Reset session token after selection
          sessionTokenRef.current =
            new google.maps.places.AutocompleteSessionToken();
        }
      });
    } catch (error) {
      console.error("[LocationSearch] Error getting place details:", error);
    }
  };

  const handleClear = () => {
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="w-full space-y-2">
      <div className="relative">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={placeholder}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              disabled={disabled || !isLoaded}
              className="pl-10"
              autoComplete="off"
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={
              disabled || !isLoaded || loading || inputValue.trim().length < 3
            }
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            type="button">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-primary border border-input rounded-md shadow-lg z-50 mt-1">
            <ul className="max-h-60 overflow-y-auto py-1">
              {suggestions.map((s) => (
                <li key={s.placeId}>
                  <button
                    onClick={() => handleSelect(s)}
                    className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm"
                    type="button">
                    {s.description}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* No results message */}
        {showSuggestions &&
          !loading &&
          suggestions.length === 0 &&
          inputValue && (
            <div className="absolute top-full left-0 right-0 bg-white border border-input rounded-md shadow-lg z-50 mt-1">
              <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                No locations found. Try a different search.
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
