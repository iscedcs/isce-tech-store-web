"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertCircle, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getGIGStations, getPickupLocations } from "@/actions/gig";
import { GIGStation, GIGPickupLocation } from "@/lib/types/gig-logistics";

interface PickupLocationsProps {
  stationId?: string;
  onStationSelect: (station: GIGStation) => void;
  onPickupLocationSelect: (location: GIGPickupLocation) => void;
  disabled?: boolean;
}

export const PickupLocations: React.FC<PickupLocationsProps> = ({
  stationId: initialStationId,
  onStationSelect,
  onPickupLocationSelect,
  disabled = false,
}) => {
  const [stations, setStations] = useState<GIGStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>(
    initialStationId || "",
  );
  const [selectedStation, setSelectedStation] = useState<GIGStation | null>(
    null,
  );
  const [pickupLocations, setPickupLocations] = useState<GIGPickupLocation[]>(
    [],
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [selectedLocation, setSelectedLocation] =
    useState<GIGPickupLocation | null>(null);
  const [loadingStations, setLoadingStations] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all stations on mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoadingStations(true);
        const result = await getGIGStations();
        if (result.success && result.data) {
          setStations(result.data);
          setError(null);
        } else {
          setError(result.message || "Failed to load stations");
        }
      } catch (err) {
        setError("Error loading stations");
      } finally {
        setLoadingStations(false);
      }
    };

    fetchStations();
  }, []);

  // Fetch pickup locations when station is selected
  useEffect(() => {
    if (!selectedStationId) {
      setPickupLocations([]);
      setSelectedLocationId("");
      setSelectedLocation(null);
      return;
    }

    const fetchPickupLocations = async () => {
      try {
        setLoadingLocations(true);
        const stationNum = parseInt(selectedStationId);
        const result = await getPickupLocations(stationNum);

        if (result.success && result.data) {
          setPickupLocations(result.data);
          setError(null);

          // Find and set the selected station
          const station = stations.find((s) => s.StationId === stationNum);
          if (station) {
            setSelectedStation(station);
            onStationSelect(station);
          }
        } else {
          setError(result.message || "Failed to load pickup locations");
          setPickupLocations([]);
        }
      } catch (err) {
        setError("Error loading pickup locations");
        setPickupLocations([]);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchPickupLocations();
  }, [selectedStationId, stations]);

  // Handle location selection
  const handleLocationSelect = (locationId: string) => {
    setSelectedLocationId(locationId);
    const location = pickupLocations.find(
      (l) => l.ServiceCentreId.toString() === locationId,
    );
    if (location) {
      setSelectedLocation(location);
      onPickupLocationSelect(location);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Station Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Pickup Station</label>
        <Select
          value={selectedStationId}
          onValueChange={setSelectedStationId}
          disabled={disabled || loadingStations}>
          <SelectTrigger>
            <SelectValue placeholder="Select a station" />
          </SelectTrigger>
          <SelectContent>
            {loadingStations ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : stations.length > 0 ? (
              stations.map((station) => (
                <SelectItem
                  key={station.StationId}
                  value={station.StationId.toString()}>
                  {station.StationName} ({station.StateName})
                </SelectItem>
              ))
            ) : (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No stations available
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Pickup Location Selection */}
      {selectedStationId && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Pickup Location</label>
          <Select
            value={selectedLocationId}
            onValueChange={handleLocationSelect}
            disabled={
              disabled || loadingLocations || pickupLocations.length === 0
            }>
            <SelectTrigger className="w-full overflow-hidden">
              <SelectValue placeholder="Select a pickup location" />
            </SelectTrigger>
            <SelectContent>
              {loadingLocations ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : pickupLocations.length > 0 ? (
                pickupLocations.map((location) => (
                  <SelectItem
                    key={location.ServiceCentreId}
                    value={location.ServiceCentreId.toString()}
                    className="max-w-(--radix-select-trigger-width) truncate">
                    <span className="truncate block">
                      {location.ServiceCentreName} ({location.Address})
                    </span>
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No pickup locations available
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Selected Location Details */}
      {selectedLocation && (
        <Card className="bg-muted/50 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Selected Pickup Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Location:</span>{" "}
              {selectedLocation.ServiceCentreName}
            </div>
            <div>
              <span className="font-medium">Address:</span>{" "}
              {selectedLocation.Address}
            </div>
            {selectedLocation.Latitude && selectedLocation.Longitude && (
              <div>
                <span className="font-medium">Coordinates:</span>{" "}
                {selectedLocation.Latitude.toFixed(4)},{" "}
                {selectedLocation.Longitude.toFixed(4)}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
