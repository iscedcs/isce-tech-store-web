"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertCircle, MapPin, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getHomeDeliveryAreas } from "@/actions/gig";
import { GIGHomeDeliveryArea } from "@/lib/types/gig-logistics";

interface DeliveryAreasProps {
  stateId?: number;
  stateName?: string;
  onAreaSelect: (area: GIGHomeDeliveryArea) => void;
  disabled?: boolean;
}

export const DeliveryAreas: React.FC<DeliveryAreasProps> = ({
  stateId: initialStateId,
  stateName: initialStateName,
  onAreaSelect,
  disabled = false,
}) => {
  const [stateId, setStateId] = useState<number | null>(initialStateId || null);
  const [stateName, setStateName] = useState<string>(initialStateName || "");
  const [deliveryAreas, setDeliveryAreas] = useState<GIGHomeDeliveryArea[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<GIGHomeDeliveryArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<GIGHomeDeliveryArea | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch delivery areas when state is selected
  useEffect(() => {
    if (!stateId) {
      setDeliveryAreas([]);
      setFilteredAreas([]);
      setSelectedAreaId("");
      setSelectedArea(null);
      return;
    }

    const fetchDeliveryAreas = async () => {
      try {
        setLoading(true);
        const result = await getHomeDeliveryAreas(stateId);

        if (result.data && result.data.length > 0) {
          setDeliveryAreas(result.data);
          setFilteredAreas(result.data);
          setError(null);
          setSearchTerm("");
        } else {
          // No areas available - show helpful message
          setDeliveryAreas([]);
          setFilteredAreas([]);
          setError(
            result.message ||
              "Delivery areas not available - please use address search to specify your location",
          );
        }
      } catch (err) {
        setError(
          "Error loading delivery areas - you can use the address search above to specify your location",
        );
        setDeliveryAreas([]);
        setFilteredAreas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryAreas();
  }, [stateId]);

  // Filter areas based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAreas(deliveryAreas);
      return;
    }

    const filtered = deliveryAreas.filter((area) => {
      const areaName = String(
        area.areaName || area.AreaName || "",
      ).toLowerCase();
      return areaName.includes(searchTerm.toLowerCase());
    });

    setFilteredAreas(filtered);
  }, [searchTerm, deliveryAreas]);

  // Handle area selection
  const handleAreaSelect = (areaId: string) => {
    setSelectedAreaId(areaId);
    const area = deliveryAreas.find(
      (a) => String(a.areaId || a.AreaId) === areaId,
    );
    if (area) {
      setSelectedArea(area);
      onAreaSelect(area);
    }
  };

  const getAreaName = (area: GIGHomeDeliveryArea): string => {
    return String(area.areaName || area.AreaName || "Unknown Area");
  };

  const getAreaId = (area: GIGHomeDeliveryArea): string => {
    return String(area.areaId || area.AreaId || Math.random());
  };

  const getAreaKm = (area: GIGHomeDeliveryArea): number | undefined => {
    return area.areaKm || area.AreaKm;
  };

  return (
    <div className="w-full space-y-4">
      {/* Error Alert with Fallback */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <div>{error}</div>
            <p className="text-xs mt-1">
              Tip: You can use the address search above to specify your delivery
              location. The shipping cost will be calculated based on your
              address coordinates.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* State Info */}
      {stateId && (
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
          Showing delivery areas for{" "}
          <span className="font-medium">{stateName}</span>
        </div>
      )}

      {/* Search Box */}
      {deliveryAreas.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search delivery areas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={disabled}
            className="pl-10"
          />
          {filteredAreas.length < deliveryAreas.length && searchTerm && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {filteredAreas.length} of {deliveryAreas.length}
            </div>
          )}
        </div>
      )}

      {/* Delivery Area Selection */}
      {stateId && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Delivery Area</label>
          <Select
            value={selectedAreaId}
            onValueChange={handleAreaSelect}
            disabled={disabled || loading || filteredAreas.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder="Select a delivery area" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : filteredAreas.length > 0 ? (
                filteredAreas.map((area) => (
                  <SelectItem key={getAreaId(area)} value={getAreaId(area)}>
                    {getAreaName(area)}{" "}
                    {getAreaKm(area) && (
                      <span className="text-muted-foreground text-xs">
                        ({getAreaKm(area)}km)
                      </span>
                    )}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {searchTerm
                    ? "No matching areas"
                    : "No delivery areas available"}
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Selected Area Details */}
      {selectedArea && (
        <Card className="bg-muted/50 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Selected Delivery Area
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Area:</span>{" "}
              {getAreaName(selectedArea)}
            </div>
            {getAreaKm(selectedArea) && (
              <div>
                <span className="font-medium">Distance:</span>{" "}
                {getAreaKm(selectedArea)} km
              </div>
            )}
            {(selectedArea.areaDescription || selectedArea.AreaDescription) && (
              <div>
                <span className="font-medium">Description:</span>{" "}
                {selectedArea.areaDescription || selectedArea.AreaDescription}
              </div>
            )}
            {(selectedArea.surgeChargePercentage ||
              selectedArea.SurgeChargePercentage) && (
              <div className="pt-2 border-t">
                <span className="font-medium">Surge Charge:</span>{" "}
                {selectedArea.surgeChargePercentage ||
                  selectedArea.SurgeChargePercentage}
                %
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {stateId && deliveryAreas.length > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          {filteredAreas.length} of {deliveryAreas.length} areas{" "}
          {searchTerm && `matching "${searchTerm}"`}
        </div>
      )}
    </div>
  );
};
