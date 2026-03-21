"use client";

import { useState, useCallback } from "react";
import { trackOrderShipment } from "@/actions/gig";
import { GIGShipmentResponse, GIGAPIError } from "@/lib/types/gig-logistics";

interface UseGIGTrackingState {
  shipment: GIGShipmentResponse | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface UseGIGTrackingReturn extends UseGIGTrackingState {
  trackShipment: (
    shipmentId: string,
    waybill?: string,
  ) => Promise<GIGShipmentResponse | null>;
  refreshTracking: () => Promise<void>;
  getCurrentStatus: () => string | null;
  isDelivered: () => boolean;
}

export const useGIGTracking = (
  initialShipmentId?: string,
): UseGIGTrackingReturn => {
  const [state, setState] = useState<UseGIGTrackingState>({
    shipment: null,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const [currentShipmentId, setCurrentShipmentId] = useState<string | null>(
    initialShipmentId || null,
  );

  const trackShipment = useCallback(
    async (shipmentId: string, waybill?: string) => {
      setCurrentShipmentId(shipmentId);
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const result = await trackOrderShipment(shipmentId);
        if (result.success && result.data) {
          setState((prev) => ({
            ...prev,
            shipment: result.data,
            loading: false,
            lastUpdated: new Date(),
          }));
          return result.data;
        } else {
          const errorMsg = result.message || "Failed to track shipment";
          setState((prev) => ({ ...prev, error: errorMsg, loading: false }));
          return null;
        }
      } catch (error: any) {
        const errorMsg = error?.message || "An error occurred while tracking";
        setState((prev) => ({ ...prev, error: errorMsg, loading: false }));
        return null;
      }
    },
    [],
  );

  const refreshTracking = useCallback(async () => {
    if (!currentShipmentId) return;
    await trackShipment(currentShipmentId);
  }, [currentShipmentId, trackShipment]);

  const getCurrentStatus = useCallback(() => {
    return state.shipment?.data?.status || null;
  }, [state.shipment]);

  const isDelivered = useCallback(() => {
    const status = getCurrentStatus();
    if (!status) return false;
    // Check if status is in delivered codes: SHD, MAHD, OKC, etc.
    const deliveredCodes = ["SHD", "MAHD", "OKC", "DDL"];
    return deliveredCodes.includes(status);
  }, [getCurrentStatus]);

  const clearTracking = useCallback(() => {
    setState({
      shipment: null,
      loading: false,
      error: null,
      lastUpdated: null,
    });
    setCurrentShipmentId(null);
  }, []);

  return {
    ...state,
    trackShipment,
    refreshTracking,
    getCurrentStatus,
    isDelivered,
  };
};
