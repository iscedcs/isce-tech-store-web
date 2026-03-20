/**
 * GIG Logistics Tracking Status Formatter
 * Maps status codes to user-friendly messages and icons
 */

export interface TrackingStatusInfo {
  code: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  isDelivered: boolean;
  isFailed: boolean;
}

const TRACKING_STATUS_MAP: Record<string, TrackingStatusInfo> = {
  // Creation & Pickup
  MCRT: {
    code: "MCRT",
    title: "Shipment Created",
    description:
      "Your shipment has been created and is being prepared for pickup",
    icon: "📦",
    color: "blue",
    isDelivered: false,
    isFailed: false,
  },
  MAPT: {
    code: "MAPT",
    title: "Assigned for Pickup",
    description: "Your shipment has been assigned for pickup",
    icon: "📍",
    color: "blue",
    isDelivered: false,
    isFailed: false,
  },
  MPIK: {
    code: "MPIK",
    title: "Picked Up",
    description: "Your shipment has been picked up",
    icon: "🚚",
    color: "blue",
    isDelivered: false,
    isFailed: false,
  },
  DLP: {
    code: "DLP",
    title: "Delayed Pickup",
    description: "Your shipment pickup has been delayed",
    icon: "⏱️",
    color: "orange",
    isDelivered: false,
    isFailed: false,
  },
  MENP: {
    code: "MENP",
    title: "Enroute Pickup",
    description: "Rider is on the way to pick up your shipment",
    icon: "🚗",
    color: "blue",
    isDelivered: false,
    isFailed: false,
  },

  // In Transit
  MSHC: {
    code: "MSHC",
    title: "Enroute Delivery",
    description: "Your shipment is on its way to the destination",
    icon: "🚚",
    color: "green",
    isDelivered: false,
    isFailed: false,
  },
  APT: {
    code: "APT",
    title: "At Processing Center",
    description: "Your shipment has arrived at a processing center in transit",
    icon: "🏢",
    color: "blue",
    isDelivered: false,
    isFailed: false,
  },
  ARP: {
    code: "ARP",
    title: "At Exchange Hub",
    description: "Your shipment is at the exchange hub for further processing",
    icon: "🏢",
    color: "blue",
    isDelivered: false,
    isFailed: false,
  },
  MSVC: {
    code: "MSVC",
    title: "At Service Centre",
    description:
      "Your shipment has arrived at a service centre for onward delivery",
    icon: "🏢",
    color: "green",
    isDelivered: false,
    isFailed: false,
  },

  // Final Destination
  MAFD: {
    code: "MAFD",
    title: "Arrived Destination",
    description: "Your shipment has arrived at the final destination",
    icon: "📍",
    color: "green",
    isDelivered: false,
    isFailed: false,
  },
  ADF: {
    code: "ADF",
    title: "At Delivery Facility",
    description: "Your shipment is at the delivery facility",
    icon: "🏢",
    color: "green",
    isDelivered: false,
    isFailed: false,
  },
  PICKED: {
    code: "PICKED",
    title: "Ready for Delivery",
    description: "Your shipment has been picked up for delivery",
    icon: "🚚",
    color: "green",
    isDelivered: false,
    isFailed: false,
  },
  WC: {
    code: "WC",
    title: "With Delivery Courier",
    description: "Your shipment is with the delivery courier",
    icon: "📦",
    color: "green",
    isDelivered: false,
    isFailed: false,
  },

  // Delivery Status
  SHD: {
    code: "SHD",
    title: "Delivered",
    description: "Your shipment has been delivered successfully",
    icon: "✅",
    color: "green",
    isDelivered: true,
    isFailed: false,
  },
  MAHD: {
    code: "MAHD",
    title: "Delivered",
    description: "Your shipment has been delivered successfully",
    icon: "✅",
    color: "green",
    isDelivered: true,
    isFailed: false,
  },
  OKC: {
    code: "OKC",
    title: "Delivered",
    description: "Your shipment has been collected and delivered",
    icon: "✅",
    color: "green",
    isDelivered: true,
    isFailed: false,
  },
  DFA: {
    code: "DFA",
    title: "Delivery Failed",
    description: "Delivery was unsuccessful. We will attempt again.",
    icon: "⚠️",
    color: "red",
    isDelivered: false,
    isFailed: true,
  },
  ATD: {
    code: "ATD",
    title: "Delivery Attempted",
    description: "Delivery was attempted but unsuccessful",
    icon: "⚠️",
    color: "orange",
    isDelivered: false,
    isFailed: false,
  },
  DLD: {
    code: "DLD",
    title: "Delivery Delayed",
    description:
      "Your delivery has been delayed due to unforeseen circumstances",
    icon: "⏱️",
    color: "orange",
    isDelivered: false,
    isFailed: false,
  },

  // Cancellation & Return
  MSCP: {
    code: "MSCP",
    title: "Cancelled",
    description: "Your shipment has been cancelled by the delivery partner",
    icon: "❌",
    color: "red",
    isDelivered: false,
    isFailed: true,
  },
  MSCC: {
    code: "MSCC",
    title: "Cancelled",
    description: "Your shipment has been cancelled",
    icon: "❌",
    color: "red",
    isDelivered: false,
    isFailed: true,
  },
  SSC: {
    code: "SSC",
    title: "Cancelled",
    description: "Your shipment has been marked as cancelled",
    icon: "❌",
    color: "red",
    isDelivered: false,
    isFailed: true,
  },
  MRTE: {
    code: "MRTE",
    title: "Returning",
    description: "Your shipment is being returned",
    icon: "↩️",
    color: "orange",
    isDelivered: false,
    isFailed: false,
  },
  SRR: {
    code: "SRR",
    title: "Return Processed",
    description: "Your shipment return has been processed",
    icon: "↩️",
    color: "orange",
    isDelivered: false,
    isFailed: false,
  },

  // Misc
  CLS: {
    code: "CLS",
    title: "Claim Filed",
    description: "A claim has been filed for your shipment",
    icon: "⚠️",
    color: "red",
    isDelivered: false,
    isFailed: true,
  },
  MRR: {
    code: "MRR",
    title: "Misrouted",
    description: "Your shipment was sent to the wrong location",
    icon: "⚠️",
    color: "red",
    isDelivered: false,
    isFailed: true,
  },
};

/**
 * Get tracking status information
 */
export function getTrackingStatusInfo(statusCode: string): TrackingStatusInfo {
  return (
    TRACKING_STATUS_MAP[statusCode] || {
      code: statusCode,
      title: "In Transit",
      description: "Your shipment is being processed",
      icon: "📦",
      color: "blue",
      isDelivered: false,
      isFailed: false,
    }
  );
}

/**
 * Get all tracking statuses
 */
export function getAllTrackingStatuses(): Record<string, TrackingStatusInfo> {
  return TRACKING_STATUS_MAP;
}

/**
 * Check if shipment is delivered
 */
export function isShipmentDelivered(statusCode: string): boolean {
  const status = getTrackingStatusInfo(statusCode);
  return status.isDelivered;
}

/**
 * Check if shipment has failed
 */
export function hasShipmentFailed(statusCode: string): boolean {
  const status = getTrackingStatusInfo(statusCode);
  return status.isFailed;
}

/**
 * Get status progress percentage (0-100)
 */
export function getDeliveryProgress(statusCode: string): number {
  const progressMap: Record<string, number> = {
    MCRT: 10,
    MAPT: 15,
    DLP: 15,
    MENP: 20,
    MPIK: 25,
    MSHC: 50,
    APT: 45,
    ARP: 45,
    MSVC: 60,
    MAFD: 70,
    ADF: 75,
    PICKED: 85,
    WC: 90,
    DFA: 50,
    ATD: 45,
    DLD: 50,
    SHD: 100,
    MAHD: 100,
    OKC: 100,
    MSCP: 0,
    MSCC: 0,
    SSC: 0,
    MRTE: 30,
    SRR: 40,
    CLS: 0,
    MRR: 25,
  };

  return progressMap[statusCode] || 50;
}

/**
 * Format timestamp for display
 */
export function formatTrackingTime(timestamp: string | Date): string {
  try {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Unknown";
  }
}
