"use client";

import { useCallback, useEffect, useState } from "react";
import { trackByWaybill } from "@/actions/gig";
import { getTrackingStatusInfo } from "@/lib/utils/gig-status-formatter";
import type { GIGMultiTrackShipment } from "@/lib/types/gig-logistics";
import { Button } from "@/components/ui/button";
import { RefreshCw, Truck, ExternalLink } from "lucide-react";

interface OrderTrackingProps {
  waybill: string;
  autoFetch?: boolean;
}

export default function OrderTracking({
  waybill,
  autoFetch = false,
}: OrderTrackingProps) {
  const [tracking, setTracking] = useState<GIGMultiTrackShipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchTracking = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await trackByWaybill(waybill);
      if (result.success && result.data) {
        setTracking(result.data);
      } else {
        setError(result.message || "Failed to fetch tracking info");
      }
    } catch {
      setError("An error occurred while fetching tracking info");
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, [waybill]);

  useEffect(() => {
    setTracking(null);
    setError(null);
    setHasFetched(false);
  }, [waybill]);

  useEffect(() => {
    if (!autoFetch || !waybill || hasFetched || loading) {
      return;
    }

    void fetchTracking();
  }, [autoFetch, fetchTracking, hasFetched, loading, waybill]);

  const statusColorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
    red: "bg-red-100 text-red-800 border-red-200",
  };

  const dotColorMap: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-accent-blue" />
          <h2 className="text-lg font-semibold text-gray-900">
            Shipment Tracking
          </h2>
        </div>
        <Button
          onClick={fetchTracking}
          disabled={loading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {hasFetched ? "Refresh" : "Track Shipment"}
        </Button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Waybill: <span className="font-mono font-medium">{waybill}</span>
      </p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {tracking && (
        <div className="space-y-4">
          {/* Current Status */}
          {tracking.MobileShipmentTrackings.length > 0 &&
            (() => {
              const latest =
                tracking.MobileShipmentTrackings[
                  tracking.MobileShipmentTrackings.length - 1
                ];
              const statusInfo = getTrackingStatusInfo(latest.Status);
              return (
                <div
                  className={`p-4 rounded-lg border ${statusColorMap[statusInfo.color] || statusColorMap.blue}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{statusInfo.icon}</span>
                    <div>
                      <p className="font-semibold">{statusInfo.title}</p>
                      <p className="text-sm opacity-80">
                        {statusInfo.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* Waybill Label Link */}
          {tracking.WaybillLabel && (
            <a
              href={tracking.WaybillLabel}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-accent-blue hover:underline">
              <ExternalLink className="w-3 h-3" />
              View Waybill Label
            </a>
          )}

          {/* Timeline */}
          {tracking.MobileShipmentTrackings.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Tracking History
              </h3>
              <div className="space-y-0">
                {[...tracking.MobileShipmentTrackings]
                  .reverse()
                  .map((event, index) => {
                    const statusInfo = getTrackingStatusInfo(event.Status);
                    const isFirst = index === 0;
                    return (
                      <div
                        key={`${event.MobileShipmentTrackingId}-${index}`}
                        className="flex gap-3">
                        {/* Timeline dot & line */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                              isFirst
                                ? dotColorMap[statusInfo.color] ||
                                  dotColorMap.blue
                                : "bg-gray-300"
                            }`}
                          />
                          {index <
                            tracking.MobileShipmentTrackings.length - 1 && (
                            <div className="w-0.5 bg-gray-200 flex-1 min-h-6" />
                          )}
                        </div>

                        {/* Event content */}
                        <div className="pb-4 flex-1">
                          <p
                            className={`text-sm font-medium ${isFirst ? "text-gray-900" : "text-gray-600"}`}>
                            {statusInfo.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {event.ScanStatusIncident}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(event.DateTime).toLocaleString("en-NG", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {!tracking && !error && !loading && !hasFetched && (
        <p className="text-sm text-gray-500">
          Click &quot;Track Shipment&quot; to see the latest tracking updates.
        </p>
      )}

      {loading && (
        <div className="flex items-center justify-center py-6">
          <RefreshCw className="w-5 h-5 animate-spin text-accent-blue" />
          <span className="ml-2 text-sm text-gray-600">
            Fetching tracking info...
          </span>
        </div>
      )}
    </div>
  );
}
