"use client";

import { useState, useTransition, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  getAdminOrders,
  updateOrderStatus,
  bulkProcessOrders,
  lookupWaybill,
  trackOrderShipments,
} from "@/actions/admin";
import { OrderStatus } from "@prisma/client";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Search,
  X,
  MapPin,
} from "lucide-react";

// GIG scan status code → human-readable description
const SCAN_STATUS_LABELS: Record<string, string> = {
  MCRT: "Shipment Created by Customer",
  MAPT: "Assigned for Pickup",
  MPIK: "Picked Up",
  DLP: "Delayed Pickup",
  MENP: "Enroute Pickup",
  MSHC: "Enroute Delivery",
  APT: "Arrived Processing Center (In Transit)",
  ARP: "Arrived Processing Center",
  MSVC: "Arrived Service Centre for Onward Processing",
  MAFD: "Arrived Final Destination",
  ADF: "Arrived Delivery Facility",
  PICKED: "Picked Up for Delivery",
  WC: "With Delivery Courier",
  SHD: "Delivered",
  MAHD: "Delivered",
  OKC: "Delivered",
  DFA: "Delivery Unsuccessful",
  ATD: "Delivery Attempted",
  DLD: "Delivery Delayed",
  MSCP: "Cancelled by Delivery Partner",
  MSCC: "Cancelled by Customer",
  SSC: "Cancelled",
  MRTE: "Enroute Return",
  SRR: "Scan for Returns",
  CLS: "Gone to Claims",
  MRR: "Misrouted",
};

function getStatusColor(code: string) {
  const delivered = ["SHD", "MAHD", "OKC"];
  const cancelled = ["MSCP", "MSCC", "SSC"];
  const failed = ["DFA", "ATD", "DLD", "CLS", "MRR"];
  const inTransit = [
    "MSHC",
    "APT",
    "ARP",
    "MSVC",
    "MAFD",
    "ADF",
    "PICKED",
    "WC",
  ];
  const pickup = ["MAPT", "MPIK", "MENP"];
  if (delivered.includes(code)) return "bg-green-100 text-green-800";
  if (cancelled.includes(code)) return "bg-red-100 text-red-800";
  if (failed.includes(code)) return "bg-orange-100 text-orange-800";
  if (inTransit.includes(code)) return "bg-indigo-100 text-indigo-800";
  if (pickup.includes(code)) return "bg-purple-100 text-purple-800";
  return "bg-blue-100 text-blue-800"; // MCRT, DLP, etc.
}

type OrderWithRelations = Awaited<
  ReturnType<typeof getAdminOrders>
>["data"][number];

const STATUS_TABS: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Paid", value: "PAID" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const statusConfig: Record<string, { color: string; icon: React.ElementType }> =
  {
    PENDING_PAYMENT: { color: "bg-gray-100 text-gray-800", icon: Clock },
    PAID: { color: "bg-blue-100 text-blue-800", icon: CreditCard },
    PENDING: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    FAILED: { color: "bg-red-100 text-red-800", icon: XCircle },
    PROCESSING: { color: "bg-purple-100 text-purple-800", icon: Package },
    SHIPPED: { color: "bg-indigo-100 text-indigo-800", icon: Truck },
    DELIVERED: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    CANCELLED: { color: "bg-red-100 text-red-800", icon: XCircle },
  };

const validTransitions: Record<string, OrderStatus[]> = {
  PAID: ["PROCESSING", "CANCELLED"],
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<OrderStatus | "ALL">("ALL");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [actionPending, setActionPending] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkPending, setBulkPending] = useState(false);
  const [waybillQuery, setWaybillQuery] = useState("");
  const [waybillResult, setWaybillResult] = useState<any>(null);
  const [waybillLooking, setWaybillLooking] = useState(false);
  const [trackingResults, setTrackingResults] = useState<any[] | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  function fetchOrders(status?: OrderStatus, page = 1) {
    startTransition(async () => {
      const result = await getAdminOrders({
        status,
        page,
        limit: 20,
      });
      if (result.success) {
        setOrders(result.data);
        setPagination(
          result.pagination
            ? {
                page: result.pagination.page,
                total: result.pagination.total,
                totalPages: result.pagination.totalPages,
              }
            : null,
        );
      }
      setLoaded(true);
    });
  }

  function handleTabChange(tab: OrderStatus | "ALL") {
    setActiveTab(tab);
    setExpandedOrder(null);
    setSelectedOrders(new Set());
    fetchOrders(tab === "ALL" ? undefined : tab);
  }

  function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    const confirmMsg =
      newStatus === "PROCESSING"
        ? "This will create a GIG shipment for this order. Continue?"
        : newStatus === "CANCELLED"
          ? "Are you sure you want to cancel this order?"
          : `Change status to ${newStatus}?`;

    if (!confirm(confirmMsg)) return;

    setActionPending(orderId);
    setMessage(null);

    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      setMessage({
        text: result.message,
        type: result.success ? "success" : "error",
      });
      setActionPending(null);
      // Refresh
      fetchOrders(activeTab === "ALL" ? undefined : activeTab);
    });
  }

  // Eligible orders for bulk selection (PAID status only)
  const eligibleOrders = orders.filter((o) => o.status === "PAID");
  const allEligibleSelected =
    eligibleOrders.length > 0 &&
    eligibleOrders.every((o) => selectedOrders.has(o.id));

  function toggleSelectOrder(orderId: string) {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (allEligibleSelected) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(eligibleOrders.map((o) => o.id)));
    }
  }

  function handleBulkProcess() {
    const count = selectedOrders.size;
    if (
      !confirm(
        `Process ${count} selected order${count !== 1 ? "s" : ""}? This will create GIG shipments for all of them.`,
      )
    )
      return;

    setBulkPending(true);
    setMessage(null);

    startTransition(async () => {
      const result = await bulkProcessOrders(Array.from(selectedOrders));
      setMessage({
        text: result.message,
        type: result.success ? "success" : "error",
      });
      setBulkPending(false);
      setSelectedOrders(new Set());
      fetchOrders(activeTab === "ALL" ? undefined : activeTab);
    });
  }

  async function handleWaybillLookup() {
    if (!waybillQuery.trim()) return;
    setWaybillLooking(true);
    setWaybillResult(null);
    const result = await lookupWaybill(waybillQuery.trim());
    setWaybillResult(result);
    setWaybillLooking(false);
  }

  async function handleTrackAll() {
    // Collect waybills from orders that have shipmentId
    const waybills = orders
      .filter((o) => o.shipmentId)
      .map((o) => o.shipmentId!);
    if (!waybills.length) return;
    setTrackingLoading(true);
    setTrackingResults(null);
    const result = await trackOrderShipments(waybills);
    if (result.success && result.data) {
      setTrackingResults(result.data);
    } else {
      setMessage({
        text: result.message || "Failed to track shipments",
        type: "error",
      });
    }
    setTrackingLoading(false);
  }

  // Load on mount
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage orders and trigger shipments
        </p>
      </div>

      {/* Waybill Lookup */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Waybill Lookup</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={waybillQuery}
            onChange={(e) => setWaybillQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleWaybillLookup()}
            placeholder="Enter waybill number..."
            className="flex-1 px-3 py-2 border text-primary border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
          <Button
            size="sm"
            disabled={waybillLooking || !waybillQuery.trim()}
            onClick={handleWaybillLookup}
            className="bg-gray-900 text-white hover:bg-gray-800">
            {waybillLooking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Lookup result */}
        {waybillResult && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setWaybillResult(null);
                setWaybillQuery("");
              }}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 z-10">
              <X className="w-4 h-4" />
            </button>
            {waybillResult.success ? (
              (() => {
                const d = Array.isArray(waybillResult.data)
                  ? waybillResult.data[0]
                  : waybillResult.data;
                if (!d)
                  return (
                    <div className="bg-red-50 text-red-800 border border-red-200 rounded-lg p-3 text-sm">
                      No data returned
                    </div>
                  );

                const isCancelled = d.IsCancelled;
                const isDelivered = d.IsDelivered;
                const statusText = d.shipmentstatus || "Unknown";
                const statusColor = isDelivered
                  ? "bg-green-100 text-green-800"
                  : isCancelled
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800";

                return (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4 text-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Waybill Number
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {d.Waybill}
                        </p>
                      </div>
                      <Badge className={statusColor}>{statusText}</Badge>
                    </div>

                    {/* Sender / Receiver */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Sender
                        </p>
                        <p className="text-gray-900 font-medium">
                          {d.SenderName}
                        </p>
                        <p className="text-gray-600">{d.SenderPhoneNumber}</p>
                        <p className="text-gray-600">{d.SenderAddress}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Receiver
                        </p>
                        <p className="text-gray-900 font-medium">
                          {d.ReceiverName}
                        </p>
                        <p className="text-gray-600">{d.ReceiverPhoneNumber}</p>
                        <p className="text-gray-600">{d.ReceiverAddress}</p>
                      </div>
                    </div>

                    {/* Shipment Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500">Vehicle</p>
                        <p className="font-medium text-gray-900">
                          {d.VehicleType}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Delivery</p>
                        <p className="font-medium text-gray-900">
                          {d.IsHomeDelivery ? "Home Delivery" : "Pickup"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Shipping Cost</p>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(d.GrandTotal || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">COD</p>
                        <p className="font-medium text-gray-900">
                          {d.IsCashOnDelivery
                            ? formatCurrency(d.CashOnDeliveryAmount)
                            : "No"}
                        </p>
                      </div>
                    </div>

                    {/* Dates & Flags */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="font-medium text-gray-900">
                          {new Date(d.DateCreated).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Modified</p>
                        <p className="font-medium text-gray-900">
                          {new Date(d.DateModified).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Customer Code</p>
                        <p className="font-medium text-gray-900">
                          {d.CustomerCode}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Station ID</p>
                        <p className="font-medium text-gray-900">
                          Sender: {d.SenderStationId} → Receiver:{" "}
                          {d.ReceiverStationId}
                        </p>
                      </div>
                    </div>

                    {/* Waybill Image */}
                    {d.WaybillImageUrl && (
                      <div className="pt-3 border-t border-gray-200">
                        <a
                          href={d.WaybillImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs">
                          View Waybill Image ↗
                        </a>
                      </div>
                    )}

                    {/* Raw data toggle */}
                    {/* <details className="pt-2">
                      <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                        View raw response
                      </summary>
                      <pre className="mt-1 text-xs text-gray-600 bg-white p-2 rounded border border-gray-200 overflow-auto max-h-60">
                        {JSON.stringify(waybillResult.data, null, 2)}
                      </pre>
                    </details> */}
                  </div>
                );
              })()
            ) : (
              <div className="bg-red-50 text-red-800 border border-red-200 rounded-lg p-3 text-sm">
                {waybillResult.message}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Track All Shipments */}
      {orders.some((o) => o.shipmentId) && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">
                Shipment Tracking
              </h3>
              <p className="text-xs text-gray-500">
                Track all orders with waybills (
                {orders.filter((o) => o.shipmentId).length} shipments)
              </p>
            </div>
            <Button
              size="sm"
              disabled={trackingLoading}
              onClick={handleTrackAll}
              className="bg-gray-900 text-white hover:bg-gray-800">
              {trackingLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <MapPin className="w-4 h-4 mr-1" />
              )}
              Track All
            </Button>
          </div>

          {/* Tracking results */}
          {trackingResults && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {trackingResults.length} shipment
                  {trackingResults.length !== 1 ? "s" : ""} tracked
                </p>
                <button
                  type="button"
                  onClick={() => setTrackingResults(null)}
                  className="text-xs text-gray-400 hover:text-gray-600">
                  Clear
                </button>
              </div>
              {trackingResults.map((shipment: any) => {
                const trackings = shipment.MobileShipmentTrackings || [];
                // Get latest unique tracking event (first one is usually the latest)
                const latest = trackings[0];
                const statusCode = latest?.Status || "UNKNOWN";
                const statusLabel =
                  SCAN_STATUS_LABELS[statusCode] ||
                  latest?.ScanStatusIncident ||
                  statusCode;
                const statusColor = getStatusColor(statusCode);

                return (
                  <div
                    key={shipment.Waybill}
                    className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                    {/* Shipment header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {shipment.Waybill}
                        </span>
                        <Badge className={statusColor}>{statusCode}</Badge>
                      </div>
                      <span className="text-gray-600 font-medium">
                        {formatCurrency(shipment.Amount)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs">{statusLabel}</p>

                    {/* Tracking timeline */}
                    {trackings.length > 0 && (
                      <details>
                        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                          {trackings.length} tracking event
                          {trackings.length !== 1 ? "s" : ""}
                        </summary>
                        <div className="mt-2 space-y-1.5">
                          {trackings.map((t: any, i: number) => (
                            <div
                              key={`${shipment.Waybill}-${i}`}
                              className="flex gap-2 text-xs">
                              <div
                                className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                                style={{
                                  backgroundColor:
                                    i === 0 ? "#2563eb" : "#d1d5db",
                                }}
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] text-primary px-1.5 py-0">
                                    {t.Status}
                                  </Badge>
                                  <span className="text-gray-400">
                                    {t.DateTime}
                                  </span>
                                </div>
                                <p className="text-gray-600 mt-0.5">
                                  {SCAN_STATUS_LABELS[t.Status] ||
                                    t.ScanStatusIncident}
                                </p>
                                {t.DepartureServiceCentre?.Name && (
                                  <p className="text-gray-400">
                                    {t.DeliveryOption} —{" "}
                                    {t.DepartureServiceCentre.Name}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}

                    {/* Waybill label link */}
                    {shipment.WaybillLabel && (
                      <a
                        href={shipment.WaybillLabel}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs inline-block">
                        View Waybill Label ↗
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Status message */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {message.text}
          <button className="ml-2 underline" onClick={() => setMessage(null)}>
            Dismiss
          </button>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {eligibleOrders.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-blue-800">
            <input
              type="checkbox"
              checked={allEligibleSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
            />
            Select all PAID orders ({eligibleOrders.length})
          </label>
          {selectedOrders.size > 0 && (
            <Button
              size="sm"
              disabled={bulkPending}
              onClick={handleBulkProcess}
              className="ml-auto bg-blue-700 text-white hover:bg-blue-800">
              {bulkPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <CheckSquare className="w-4 h-4 mr-1" />
              )}
              Process Selected ({selectedOrders.size})
            </Button>
          )}
        </div>
      )}

      {/* Loading state */}
      {isPending && !actionPending && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* Orders list */}
      {!isPending && loaded && orders.length === 0 && (
        <div className="text-center py-12 border border-gray-200 rounded-lg bg-white">
          <p className="text-gray-500">No orders found</p>
        </div>
      )}

      <div className="space-y-3">
        {orders.map((order) => {
          const config = statusConfig[order.status] || statusConfig.PENDING;
          const Icon = config.icon;
          const isExpanded = expandedOrder === order.id;
          const transitions = validTransitions[order.status] || [];

          return (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Order header */}
              <div className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                {/* Checkbox for PAID orders */}
                {order.status === "PAID" && (
                  <input
                    type="checkbox"
                    checked={selectedOrders.has(order.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelectOrder(order.id);
                    }}
                    className="w-4 h-4 mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0 cursor-pointer"
                  />
                )}
                <button
                  type="button"
                  className="flex items-center justify-between flex-1 min-w-0"
                  onClick={() =>
                    setExpandedOrder(isExpanded ? null : order.id)
                  }>
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Icon className="w-5 h-5 text-gray-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">
                          #{order.id.substring(0, 8).toUpperCase()}
                        </span>
                        <Badge className={config.color}>{order.status}</Badge>
                        {order.shipmentId && (
                          <Badge
                            variant="outline"
                            className="text-xs text-primary">
                            Ship: {order.shipmentId}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" · "}
                        {order.orderItems.length} item
                        {order.orderItems.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4 space-y-4">
                  {/* Customer / Shipping info */}
                  {order.shippingInfo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          Customer
                        </h4>
                        <p className="text-sm text-gray-900">
                          {order.shippingInfo.firstName}{" "}
                          {order.shippingInfo.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.shippingInfo.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.shippingInfo.phone}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          {order.shippingInfo.deliveryMethod === "pickup"
                            ? "Pickup"
                            : "Delivery"}
                        </h4>
                        <p className="text-sm text-gray-900">
                          {order.shippingInfo.deliveryMethod === "pickup"
                            ? "Pickup"
                            : "Home Delivery"}
                        </p>
                        {order.shippingInfo.deliveryMethod === "pickup" ? (
                          <>
                            {order.shippingInfo.pickupLocationName && (
                              <p className="text-sm text-gray-900">
                                {order.shippingInfo.pickupLocationName}
                              </p>
                            )}
                            <p className="text-sm text-gray-600">
                              {order.shippingInfo.pickupLocationAddress ||
                                order.shippingInfo.address}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600">
                              {order.shippingInfo.address}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.shippingInfo.city},{" "}
                              {order.shippingInfo.state}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order items */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Items
                    </h4>
                    <div className="divide-y divide-gray-100">
                      {order.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="py-2 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity}
                              {item.cardColor && ` · Color: ${item.cardColor}`}
                            </p>
                          </div>
                          <span className="text-sm text-gray-900">
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2 space-y-1 text-sm">
                      <div className="flex justify-between text-gray-500">
                        <span>Delivery</span>
                        <span>{formatCurrency(order.deliveryPrice)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>VAT</span>
                        <span>{formatCurrency(order.vatAmount)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-gray-900">
                        <span>Total</span>
                        <span>{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipment info */}
                  {order.shipmentId && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        Shipment
                      </h4>
                      <p className="text-sm text-gray-900">
                        ID: {order.shipmentId}
                      </p>
                      {order.shipmentStatus && (
                        <p className="text-sm text-gray-600">
                          Status: {order.shipmentStatus}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Status actions */}
                  {transitions.length > 0 && (
                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                      {transitions.map((status) => {
                        const isDestructive = status === "CANCELLED";
                        const isShipment =
                          status === "PROCESSING" && !order.shipmentId;
                        return (
                          <Button
                            key={status}
                            size="sm"
                            variant={isDestructive ? "destructive" : "default"}
                            disabled={actionPending === order.id}
                            onClick={() => handleStatusChange(order.id, status)}
                            className={
                              !isDestructive
                                ? "bg-gray-900 text-white hover:bg-gray-800"
                                : ""
                            }>
                            {actionPending === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : null}
                            {isShipment
                              ? "Process & Ship"
                              : `Mark ${status.charAt(0) + status.slice(1).toLowerCase()}`}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages} (
            {pagination.total} orders)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || isPending}
              onClick={() =>
                fetchOrders(
                  activeTab === "ALL" ? undefined : activeTab,
                  pagination!.page - 1,
                )
              }>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages || isPending}
              onClick={() =>
                fetchOrders(
                  activeTab === "ALL" ? undefined : activeTab,
                  pagination!.page + 1,
                )
              }>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
