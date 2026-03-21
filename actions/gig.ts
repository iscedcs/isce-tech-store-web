"use server";

import { revalidatePath } from "next/cache";
import gigShipmentService from "@/lib/services/gig-shipment.service";
import gigAuthService from "@/lib/services/gig-auth.service";
import { defaultWarehouse } from "@/lib/utils";
import {
  GIGStation,
  GIGPickupLocation,
  GIGPriceRequest,
  GIGBulkPriceRequest,
  GIGBulkPriceShipment,
  GIGCreateShipmentRequest,
  GIGShipmentItem,
  GIGVehicleType,
  GIGShipmentType,
  GIGPickupOption,
} from "@/lib/types/gig-logistics";

/**
 * Server Actions for GIG Logistics API
 * These run on the server and are safe for API calls
 */

/**
 * Initialize GIG authentication
 */
export async function initializeGIGAuth(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const authenticated = await gigAuthService.autoLogin();

    if (authenticated) {
      return {
        success: true,
        message: "GIG authentication successful",
      };
    } else {
      return {
        success: false,
        message: "GIG authentication failed - credentials missing or invalid",
      };
    }
  } catch (error) {
    console.error("[GIG Action] Auth error:", error);
    return {
      success: false,
      message: "Failed to initialize GIG authentication",
    };
  }
}

/**
 * Get all Nigerian stations for delivery selection
 */
export async function getGIGStations(): Promise<{
  success: boolean;
  data: GIGStation[];
  message?: string;
}> {
  try {
    const stations = await gigShipmentService.getStations();
    return {
      success: true,
      data: stations,
    };
  } catch (error) {
    console.error("[GIG Action] Get stations error:", error);
    return {
      success: false,
      data: [],
      message: "Failed to fetch GIG stations",
    };
  }
}

/**
 * Get pickup locations for a specific station
 */
export async function getPickupLocations(stationId: number): Promise<{
  success: boolean;
  data: GIGPickupLocation[];
  message?: string;
}> {
  try {
    if (!stationId) {
      return {
        success: false,
        data: [],
        message: "Station ID is required",
      };
    }

    const locations = await gigShipmentService.getPickupLocations(stationId);
    return {
      success: true,
      data: locations,
    };
  } catch (error) {
    console.error("[GIG Action] Get pickup locations error:", error);
    return {
      success: false,
      data: [],
      message: "Failed to fetch pickup locations",
    };
  }
}

/**
 * Get home delivery areas for a state
 */
export async function getHomeDeliveryAreas(
  stateId: number,
  search?: string,
  limit?: number,
): Promise<{
  success: boolean;
  data: any[];
  message?: string;
}> {
  try {
    if (!stateId) {
      return {
        success: false,
        data: [],
        message: "State ID is required",
      };
    }

    const areas = await gigShipmentService.getHomeDeliveryAreas(
      stateId,
      search,
      limit || 50,
      0,
    );

    // If no areas found, consider it a success with empty data
    // User can use address search as fallback
    return {
      success: true,
      data: areas,
      ...(areas.length === 0 && {
        message: "Delivery areas not available - use address search instead",
      }),
    };
  } catch (error) {
    console.error("[GIG Action] Get home delivery areas error:", error);
    return {
      success: false,
      data: [],
      message:
        "Delivery areas temporarily unavailable - use address search instead",
    };
  }
}

/**
 * Calculate shipping price for a delivery
 * Uses single endpoint for 1 product, bulk endpoint for multiple products
 */
export async function calculateShippingPrice(request: {
  deliveryType: "pickup" | "home_delivery";
  senderStationId: number;
  receiverStationId?: number;
  receiverLatitude?: number;
  receiverLongitude?: number;
  address: string;
  itemCount: number;
  totalWeight?: number;
  productNames?: string[]; // Product names from DB
  productDescriptions?: string[]; // Product descriptions from DB
  cartItems?: Array<{
    title: string;
    description?: string;
    quantity: number;
    weight?: number;
  }>;
}): Promise<{
  success: boolean;
  price: number;
  message?: string;
}> {
  try {
    const {
      deliveryType,
      senderStationId,
      receiverStationId,
      receiverLatitude,
      receiverLongitude,
      address,
      itemCount,
      totalWeight,
      productNames,
      productDescriptions,
      cartItems,
    } = request;

    // Pickup is always free
    if (deliveryType === "pickup") {
      return {
        success: true,
        price: 0,
        message: "Pickup is free",
      };
    }

    // For home delivery, calculate actual price
    if (deliveryType === "home_delivery") {
      if (!receiverLatitude || !receiverLongitude) {
        return {
          success: false,
          price: 0,
          message: "Receiver location coordinates are required",
        };
      }

      const uniqueProducts =
        cartItems && cartItems.length > 1 ? cartItems : null;

      // Multiple distinct products → use bulk pricing
      if (uniqueProducts) {
        // Get merchant channel code for bulk pricing
        const channelCode = gigAuthService.getUserChannelCode();
        if (!channelCode) {
          // Re-login to get channel code
          await gigAuthService.autoLogin();
        }
        const customerCode = gigAuthService.getUserChannelCode() || "";

        const bulkShipments: GIGBulkPriceShipment[] = uniqueProducts.map(
          (item, index) => ({
            Merchant: {
              CustomerCode: customerCode,
              CustomerType: 0,
              SenderStationId: senderStationId,
              SenderLocation: {
                Latitude: String(defaultWarehouse.latitude),
                Longitude: String(defaultWarehouse.longitude),
              },
            },
            ShipmentDetails: {
              VehicleType: GIGVehicleType.Bike,
              PickUpOptions: GIGPickupOption.HomeDelivery,
            },
            ShipmentItems: [
              {
                Quantity: item.quantity,
                ShipmentType: GIGShipmentType.Regular,
                ItemName:
                  item.title || productNames?.[index] || "Smart Device Cards",
                IsVolumetric: false,
                Weight: (item.weight || 0.01) * item.quantity,
                Description:
                  item.description ||
                  productDescriptions?.[index] ||
                  "ISCE Smart Device Order",
                Value: item.quantity,
              },
            ],
          }),
        );

        const bulkRequest: GIGBulkPriceRequest = {
          ReceiverDetails: {
            ReceiverStationId: receiverStationId,
            ReceiverLocation: {
              Latitude: String(receiverLatitude),
              Longitude: String(receiverLongitude),
            },
          },
          Shipments: bulkShipments,
        };

        console.log("[GIG Bulk Price Calculation Request]");
        console.log(JSON.stringify(bulkRequest, null, 2));

        const price =
          await gigShipmentService.calculateBulkShippingPrice(bulkRequest);

        console.log("[GIG Bulk Price Calculation Response]");
        console.log("Calculated Total Price:", price);

        return {
          success: price !== null,
          price: price || 0,
          message:
            price !== null
              ? "Bulk price calculated"
              : "Failed to calculate bulk price",
        };
      }

      // Single product → use single pricing endpoint
      const priceRequest: GIGPriceRequest = {
        SenderStationId: senderStationId,
        SenderLocation: {
          Latitude: defaultWarehouse.latitude,
          Longitude: defaultWarehouse.longitude,
        },
        IsPriorityShipment: false,
        VehicleType: GIGVehicleType.Bike,
        PickUpOptions: GIGPickupOption.HomeDelivery,
        ReceiverLocation: {
          Latitude: receiverLatitude,
          Longitude: receiverLongitude,
        },
        ShipmentItems: [
          {
            Quantity: itemCount,
            ShipmentType: GIGShipmentType.Regular,
            ItemName: productNames?.[0] || "Smart Device Cards",
            IsVolumetric: false,
            Weight: totalWeight || itemCount * 0.01,
            Description: productDescriptions?.[0] || "ISCE Smart Device Order",
            Value: itemCount,
          },
        ],
      };

      console.log("[GIG Price Calculation Request]");
      console.log(JSON.stringify(priceRequest, null, 2));

      const price =
        await gigShipmentService.calculateShippingPrice(priceRequest);

      console.log("[GIG Price Calculation Response]");
      console.log("Calculated Price:", price);

      return {
        success: price !== null,
        price: price || 0,
        message:
          price !== null ? "Price calculated" : "Failed to calculate price",
      };
    }

    return {
      success: false,
      price: 0,
      message: "Invalid delivery type",
    };
  } catch (error) {
    console.error("[GIG Action] Calculate price error:", error);
    return {
      success: false,
      price: 0,
      message: "Failed to calculate shipping price",
    };
  }
}

/**
 * Create a shipment after payment verification
 * Called when order status changes to PROCESSING
 */
export async function createShipmentForOrder(orderData: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  latitude?: number;
  longitude?: number;
  itemCount: number;
  totalWeight?: number;
  deliveryType: "pickup" | "home_delivery";
  pickupLocationId?: number;
  productNames?: string[]; // Product names from DB
  productDescriptions?: string[]; // Product descriptions from DB
  orderItems?: Array<{
    name: string;
    description?: string;
    quantity: number;
    weight?: number;
  }>;
}): Promise<{
  success: boolean;
  shipmentId?: string;
  waybill?: string;
  message?: string;
}> {
  try {
    const {
      orderId,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      latitude,
      longitude,
      itemCount,
      totalWeight,
      deliveryType,
      pickupLocationId,
      productNames,
      productDescriptions,
      orderItems,
    } = orderData;

    // Default sender: Lagos (Festac)
    const SENDER_STATION_ID = 4; // Lagos
    const SENDER_NAME = "ISCE Store";
    const SENDER_PHONE = "+2349137206365";
    const SENDER_ADDRESS = "Amg workspace, Festac Town, Lagos, Nigeria";

    // Ensure GIG authentication
    if (!gigAuthService.isAuthenticated()) {
      await gigAuthService.autoLogin();
    }

    // Truncate description to GIG's 500 char limit
    const truncateDesc = (desc: string) =>
      desc.length > 200 ? desc.slice(0, 197) + "..." : desc;

    // Build shipment items: one per distinct product if multiple, otherwise single item
    const shipmentItems: GIGShipmentItem[] =
      orderItems && orderItems.length > 0
        ? orderItems.map((item, index) => ({
            Quantity: item.quantity,
            ShipmentType: GIGShipmentType.Regular,
            ItemName:
              item.name || productNames?.[index] || "Smart Device Cards",
            IsVolumetric: false,
            Weight: (item.weight || 0.01) * item.quantity,
            Description: truncateDesc(
              item.description ||
                productDescriptions?.[index] ||
                `ISCE Store Order #${orderId}`,
            ),
            Value: item.quantity,
          }))
        : [
            {
              Quantity: itemCount,
              ShipmentType: GIGShipmentType.Regular,
              ItemName: productNames?.[0] || "Smart Device Cards",
              IsVolumetric: false,
              Weight: totalWeight || itemCount * 0.01,
              Description: truncateDesc(
                productDescriptions?.[0] || `ISCE Store Order #${orderId}`,
              ),
              Value: itemCount,
            },
          ];

    const shipmentRequest: GIGCreateShipmentRequest = {
      SenderDetails: {
        SenderName: SENDER_NAME,
        SenderPhoneNumber: SENDER_PHONE,
        SenderStationId: SENDER_STATION_ID,
        SenderAddress: SENDER_ADDRESS,
        InputtedSenderAddress: SENDER_ADDRESS,
        SenderLocality: "Festac Town",
        SenderLocation: {
          Latitude: String(defaultWarehouse.latitude),
          Longitude: String(defaultWarehouse.longitude),
        },
      },
      ReceiverDetails: {
        ReceiverStationId:
          deliveryType === "pickup" ? pickupLocationId : undefined,
        ReceiverName: customerName,
        ReceiverPhoneNumber: customerPhone,
        ReceiverAddress: deliveryAddress,
        InputtedReceiverAddress: deliveryAddress,
        ReceiverLocation:
          latitude && longitude
            ? {
                Latitude: String(latitude),
                Longitude: String(longitude),
              }
            : undefined,
      },
      ShipmentDetails: {
        VehicleType: GIGVehicleType.Bike,
        IsBatchPickUp: 0,
        IsFromAgility: 0,
      },
      ShipmentItems: shipmentItems,
    };

    console.log("[GIG Shipment Creation Request]");
    console.log(JSON.stringify(shipmentRequest, null, 2));

    const result = await gigShipmentService.createShipment(shipmentRequest);

    console.log("[GIG Shipment Creation Response]");
    console.log(JSON.stringify(result, null, 2));

    if (result) {
      const shipmentData = Array.isArray(result) ? result[0] : result;

      // Revalidate order page
      revalidatePath(`/profile/orders/${orderId}`);

      return {
        success: true,
        waybill: shipmentData.Waybill || shipmentData.waybill,
        message: "Shipment created successfully",
      };
    }

    return {
      success: false,
      message: "Failed to create shipment",
    };
  } catch (error) {
    console.error("[GIG Action] Create shipment error:", error);
    return {
      success: false,
      message: "Failed to create shipment at GIG",
    };
  }
}

/**
 * Create shipments for multiple orders in parallel.
 * Uses the proven single /capture/preshipment endpoint for each order
 * via Promise.allSettled for reliable bulk processing.
 */
export async function createBulkShipmentsForOrders(
  orders: Array<{
    orderId: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    latitude?: number;
    longitude?: number;
    deliveryType: "pickup" | "home_delivery";
    pickupLocationId?: number;
    orderItems: Array<{
      name: string;
      description?: string;
      quantity: number;
      weight?: number;
    }>;
  }>,
): Promise<{
  success: boolean;
  results: Array<{
    orderId: string;
    success: boolean;
    waybill?: string;
    message?: string;
  }>;
}> {
  try {
    if (!gigAuthService.isAuthenticated()) {
      await gigAuthService.autoLogin();
    }

    // Call the single shipment endpoint for each order in parallel
    const settled = await Promise.allSettled(
      orders.map((order) => {
        let totalWeight = 0;
        let itemCount = 0;
        for (const item of order.orderItems) {
          itemCount += item.quantity;
          totalWeight += (item.weight || 0.00001) * item.quantity;
        }

        return createShipmentForOrder({
          orderId: order.orderId,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          deliveryAddress: order.deliveryAddress,
          latitude: order.latitude,
          longitude: order.longitude,
          itemCount,
          totalWeight,
          deliveryType: order.deliveryType,
          pickupLocationId: order.pickupLocationId,
          orderItems: order.orderItems,
        });
      }),
    );

    const results = orders.map((order, index) => {
      const result = settled[index];
      if (result.status === "fulfilled" && result.value.success) {
        return {
          orderId: order.orderId,
          success: true,
          waybill: result.value.waybill,
        };
      }
      return {
        orderId: order.orderId,
        success: false,
        message:
          result.status === "fulfilled"
            ? result.value.message
            : result.reason?.message || "Shipment creation failed",
      };
    });

    const successCount = results.filter((r) => r.success).length;
    return {
      success: successCount > 0,
      results,
    };
  } catch (error: any) {
    console.error("[GIG Action] Bulk shipment error:", error);
    return {
      success: false,
      results: orders.map((o) => ({
        orderId: o.orderId,
        success: false,
        message: error.message || "Failed to create shipments",
      })),
    };
  }
}

/**
 * Track a shipment by ID
 */
export async function trackOrderShipment(shipmentId: string): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> {
  try {
    if (!shipmentId) {
      return {
        success: false,
        message: "Shipment ID is required",
      };
    }

    const result = await gigShipmentService.trackShipment(shipmentId);

    if (result.status === 200) {
      return {
        success: true,
        data: result.data,
        message: "Tracking info retrieved",
      };
    }

    return {
      success: false,
      message: "Failed to track shipment",
    };
  } catch (error) {
    console.error("[GIG Action] Track shipment error:", error);
    return {
      success: false,
      message: "Failed to retrieve tracking information",
    };
  }
}

/**
 * Validate if delivery location is available with GIG
 */
export async function validateDeliveryLocation(
  stateId: number,
  address: string,
): Promise<{
  success: boolean;
  available: boolean;
  message?: string;
}> {
  try {
    const areas = await gigShipmentService.getHomeDeliveryAreas(
      stateId,
      address,
      5,
    );

    return {
      success: true,
      available: areas.length > 0,
      message:
        areas.length > 0
          ? "Location available for delivery"
          : "Location not available",
    };
  } catch (error) {
    console.error("[GIG Action] Validate location error:", error);
    return {
      success: false,
      available: false,
      message: "Failed to validate delivery location",
    };
  }
}

/**
 * Get merchant wallet balance
 * For admin dashboard
 */
export async function getMerchantWalletBalance(): Promise<{
  success: boolean;
  balance?: number;
  message?: string;
}> {
  try {
    const walletData = await gigShipmentService.getWalletBalance();

    return {
      success: true,
      balance: walletData?.balance || walletData?.amount || 0,
      message: "Wallet balance retrieved",
    };
  } catch (error) {
    console.error("[GIG Action] Get wallet error:", error);
    return {
      success: false,
      message: "Failed to retrieve wallet balance",
    };
  }
}

/**
 * Track a shipment by waybill number (customer-facing)
 * Uses GET /track/mobileShipment?Waybill=...
 */
export async function trackByWaybill(waybill: string): Promise<{
  success: boolean;
  data?: import("@/lib/types/gig-logistics").GIGMultiTrackShipment;
  message?: string;
}> {
  try {
    if (!waybill?.trim()) {
      return { success: false, message: "Waybill number is required" };
    }

    const result = await gigShipmentService.trackByWaybill(waybill.trim());

    if (result.status === 200 && result.data?.length > 0) {
      return {
        success: true,
        data: result.data[0],
        message: "Tracking info retrieved",
      };
    }

    return { success: false, message: "No tracking information found" };
  } catch (error) {
    console.error("[GIG Action] Track by waybill error:", error);
    return {
      success: false,
      message: "Failed to retrieve tracking information",
    };
  }
}
