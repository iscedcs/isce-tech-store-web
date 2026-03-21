"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, TrendingDown, AlertCircle } from "lucide-react";
import { calculateShippingPrice } from "@/actions/gig";
import { formatCurrency } from "@/lib/utils";

interface ShippingCostDisplayProps {
  deliveryMethod: "pickup" | "home-delivery";
  quantity: number;
  weight?: number; // Weight in kg per item
  stateId?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  disabled?: boolean;
  items?: Array<{
    title: string;
    description?: string;
    quantity: number;
    weight?: number;
  }>; // Cart items for product info
  onCostCalculated?: (cost: number | null) => void;
}

export const ShippingCostDisplay: React.FC<ShippingCostDisplayProps> = ({
  deliveryMethod,
  quantity,
  weight = 0.01, // Default to 0.01 kg (10g) per item
  stateId,
  latitude,
  longitude,
  address,
  disabled = false,
  items,
  onCostCalculated,
}) => {
  const [cost, setCost] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Notify parent when cost changes
  useEffect(() => {
    onCostCalculated?.(cost);
  }, [cost, onCostCalculated]);

  // Fetch shipping cost whenever relevant props change
  useEffect(() => {
    const calculateCost = async () => {
      // Pickup is always free
      if (deliveryMethod === "pickup") {
        setCost(0);
        setError(null);
        setLastUpdated(new Date());
        return;
      }

      // Don't calculate if missing required data for home delivery
      // For home delivery, we need coordinates from address search
      if (!latitude || !longitude) {
        setCost(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const totalWeight = (weight || 0.01) * quantity;

        // Extract product info from items
        const productNames = items?.map((item) => item.title) || [];
        const productDescriptions =
          items?.map((item) => item.description || "") || [];

        // Build cartItems array for bulk pricing (when multiple distinct products)
        const cartItems = items?.map((item) => ({
          title: item.title,
          description: item.description,
          quantity: item.quantity,
          weight: item.weight || weight || 0.01,
        }));

        const priceRequest = {
          deliveryType: "home_delivery" as const,
          senderStationId: 4, // Default: Lagos (Festac)
          receiverStationId: stateId,
          receiverLatitude: latitude,
          receiverLongitude: longitude,
          address: address || "",
          itemCount: quantity,
          totalWeight,
          productNames,
          productDescriptions,
          cartItems,
        };

        const result = await calculateShippingPrice(priceRequest);

        if (result.success && result.price !== undefined) {
          setCost(result.price);
          setLastUpdated(new Date());
        } else {
          setError(result.message || "Unable to calculate shipping cost");
          setCost(null);
        }
      } catch (err) {
        setError("Error calculating shipping cost");
        setCost(null);
        console.error("Shipping cost calculation error:", err);
      } finally {
        setLoading(false);
      }
    };

    calculateCost();
  }, [deliveryMethod, quantity, weight, stateId, latitude, longitude, address]);

  // Show nothing for pickup
  if (deliveryMethod === "pickup") {
    return (
      <Card className="bg-green-950/30 border-green-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <TrendingDown className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-400">Pickup</p>
              <p className="text-xs text-green-400/70">Free</p>
            </div>
            <div className="ml-auto">
              <p className="text-2xl font-bold text-green-400">₦0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error && !loading) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm text-foreground">
              Calculating shipping cost...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show cost when available
  if (cost !== null) {
    return (
      <Card className="bg-accent-blue/5 border-accent-blue/20">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Shipping Cost
                </p>
                {deliveryMethod === "home-delivery" && (
                  <p className="text-xs text-muted-foreground">Home delivery</p>
                )}
              </div>
              <p className="text-2xl font-bold text-accent-blue">
                {formatCurrency(cost)}
              </p>
            </div>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground text-right">
                Updated {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state when no data available
  return (
    <Card className="bg-muted/30">
      <CardContent className="pt-6">
        <p className="text-sm text-foreground">
          Enter delivery details to see shipping cost
        </p>
      </CardContent>
    </Card>
  );
};
