"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createShipmentForOrder, createBulkShipmentsForOrders } from "./gig";
import gigShipmentService from "@/lib/services/gig-shipment.service";
import { OrderStatus } from "@prisma/client";
import { ADMIN_ROLES } from "@/lib/const";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }
  if (!ADMIN_ROLES.includes(session.user.userType)) {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

/**
 * Get all orders for admin dashboard
 */
export async function getAdminOrders(filters?: {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}) {
  try {
    await requireAdmin();

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where = filters?.status ? { status: filters.status } : {};

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          orderItems: { include: { product: true } },
          shippingInfo: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    return {
      success: true,
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error: any) {
    console.error("[Admin] Get orders error:", error);
    return { success: false, error: error.message, data: [], pagination: null };
  }
}

/**
 * Update order status — triggers shipment creation when moving to PROCESSING
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
): Promise<{ success: boolean; message: string; shipmentId?: string }> {
  try {
    await requireAdmin();

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { product: true } },
        shippingInfo: true,
      },
    });

    if (!order) {
      return { success: false, message: "Order not found" };
    }

    // Validate status transitions
    const validTransitions: Record<string, OrderStatus[]> = {
      PAID: ["PROCESSING", "CANCELLED"],
      PENDING: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED"],
    };

    const currentStatus = order.status;
    const allowed = validTransitions[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      return {
        success: false,
        message: `Cannot transition from ${currentStatus} to ${newStatus}`,
      };
    }

    // If moving to PROCESSING, create GIG shipment
    if (newStatus === "PROCESSING" && !order.shipmentId) {
      const shippingInfo = order.shippingInfo;
      if (!shippingInfo) {
        return { success: false, message: "No shipping info found for order" };
      }

      const deliveryType =
        shippingInfo.deliveryMethod === "pickup"
          ? ("pickup" as const)
          : ("home_delivery" as const);

      let totalWeight = 0;
      let itemCount = 0;
      for (const item of order.orderItems) {
        itemCount += item.quantity;
        totalWeight += (item.product.weight || 0.00001) * item.quantity;
      }

      const orderItems = order.orderItems.map((item) => ({
        name: item.product.name,
        description: item.product.description || "",
        quantity: item.quantity,
        weight: item.product.weight || 0.00001,
      }));

      const shipmentResult = await createShipmentForOrder({
        orderId: order.id,
        customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customerPhone: shippingInfo.phone,
        customerEmail: shippingInfo.email,
        deliveryAddress: shippingInfo.address,
        latitude: shippingInfo.latitude ?? undefined,
        longitude: shippingInfo.longitude ?? undefined,
        itemCount,
        totalWeight,
        deliveryType,
        productNames: order.orderItems.map((i) => i.product.name),
        productDescriptions: order.orderItems.map(
          (i) => i.product.description || "",
        ),
        orderItems,
        ...(deliveryType === "pickup" && shippingInfo.stationId
          ? { pickupLocationId: shippingInfo.stationId }
          : {}),
      });

      if (shipmentResult.success && shipmentResult.waybill) {
        await db.order.update({
          where: { id: orderId },
          data: {
            status: "PROCESSING",
            shipmentId: shipmentResult.waybill,
            shipmentStatus: "CREATED",
          },
        });

        // Send processing email to customer
        try {
          const { shippingInfo, orderItems, totalAmount } = order;
          const {
            firstName,
            lastName,
            email: customerEmail,
          } = shippingInfo || {};
          const { orderProcessingTemplate } =
            await import("@/lib/mail-templates");
          const { sendMail } = await import("@/lib/mail");
          const html = orderProcessingTemplate({
            customerName: `${firstName || "Customer"} ${lastName || ""}`.trim(),
            orderId: order.id,
            order: { orderItems, totalAmount },
            shippingInfo,
            waybill: shipmentResult.waybill,
          });
          await sendMail({
            to: customerEmail as string,
            subject: `Order #${order.id} is being processed – ISCE Store`,
            html,
          });
        } catch (err) {
          console.error("[Mail] Failed to send processing email:", err);
        }

        revalidatePath("/admin/orders");
        return {
          success: true,
          message: `Order moved to PROCESSING. Waybill Number: ${shipmentResult.waybill}`,
          shipmentId: shipmentResult.waybill,
        };
      } else {
        return {
          success: false,
          message: `Failed to create shipment: ${shipmentResult.message}`,
        };
      }
    }

    // For other status changes, just update
    await db.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    // Send status-based email notifications
    try {
      const { shippingInfo, orderItems, totalAmount } = order;
      const { firstName, lastName, email: customerEmail } = shippingInfo || {};

      if (customerEmail) {
        const customerName =
          `${firstName || "Customer"} ${lastName || ""}`.trim();
        const { sendMail } = await import("@/lib/mail");

        if (newStatus === "SHIPPED") {
          const { orderShippedTemplate } = await import("@/lib/mail-templates");
          const html = orderShippedTemplate({
            customerName,
            orderId: order.id,
            order: { orderItems, totalAmount },
            shippingInfo,
            waybill: order.shipmentId || "N/A",
          });
          await sendMail({
            to: customerEmail,
            subject: `Order #${order.id} shipped – ISCE Store`,
            html,
          });
        }

        if (newStatus === "DELIVERED") {
          const { orderDeliveredTemplate } =
            await import("@/lib/mail-templates");
          const html = orderDeliveredTemplate({
            customerName,
            orderId: order.id,
            order: { orderItems, totalAmount },
            shippingInfo,
          });
          await sendMail({
            to: customerEmail,
            subject: `Order #${order.id} delivered – ISCE Store`,
            html,
          });
        }

        if (newStatus === "CANCELLED") {
          const { orderCancelledTemplate } =
            await import("@/lib/mail-templates");
          const html = orderCancelledTemplate({
            customerName,
            orderId: order.id,
            order: { orderItems, totalAmount },
            shippingInfo,
          });
          await sendMail({
            to: customerEmail,
            subject: `Order #${order.id} cancelled – ISCE Store`,
            html,
          });
        }
      }
    } catch (err) {
      console.error(`[Mail] Failed to send ${newStatus} email:`, err);
    }

    revalidatePath("/admin/orders");
    return { success: true, message: `Order status updated to ${newStatus}` };
  } catch (error: any) {
    console.error("[Admin] Update order status error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Bulk process orders — moves multiple PAID orders to PROCESSING
 * and creates GIG shipments via the bulk endpoint
 */
export async function bulkProcessOrders(orderIds: string[]): Promise<{
  success: boolean;
  message: string;
  results: Array<{
    orderId: string;
    success: boolean;
    waybill?: string;
    message?: string;
  }>;
}> {
  try {
    await requireAdmin();

    if (!orderIds.length) {
      return { success: false, message: "No orders selected", results: [] };
    }

    // Fetch all selected orders with their items and shipping info
    const orders = await db.order.findMany({
      where: { id: { in: orderIds } },
      include: {
        orderItems: { include: { product: true } },
        shippingInfo: true,
      },
    });

    // Validate: all must be PAID and have shipping info
    const invalid = orders.filter(
      (o) => o.status !== "PAID" || !o.shippingInfo,
    );
    if (invalid.length > 0) {
      const ids = invalid.map((o) => o.id.substring(0, 8)).join(", ");
      return {
        success: false,
        message: `Orders not eligible (must be PAID with shipping info): ${ids}`,
        results: [],
      };
    }

    // Build bulk shipment payload
    const bulkOrders = orders.map((order) => {
      const si = order.shippingInfo!;
      const deliveryType =
        si.deliveryMethod === "pickup"
          ? ("pickup" as const)
          : ("home_delivery" as const);

      return {
        orderId: order.id,
        customerName: `${si.firstName} ${si.lastName}`,
        customerPhone: si.phone,
        deliveryAddress: si.address,
        latitude: si.latitude ?? undefined,
        longitude: si.longitude ?? undefined,
        deliveryType,
        ...(deliveryType === "pickup" && si.stationId
          ? { pickupLocationId: si.stationId }
          : {}),
        orderItems: order.orderItems.map((item) => ({
          name: item.product.name,
          description: item.product.description || "",
          quantity: item.quantity,
          weight: item.product.weight || 0.00001,
        })),
      };
    });

    const bulkResult = await createBulkShipmentsForOrders(bulkOrders);

    // Update each order with its waybill (or leave unchanged if failed)
    const updateResults = await Promise.all(
      bulkResult.results.map(async (result) => {
        if (result.success && result.waybill) {
          await db.order.update({
            where: { id: result.orderId },
            data: {
              status: "PROCESSING",
              shipmentId: result.waybill,
              shipmentStatus: "CREATED",
            },
          });
          return result;
        }
        return result;
      }),
    );

    const successCount = updateResults.filter((r) => r.success).length;
    const failCount = updateResults.filter((r) => !r.success).length;

    revalidatePath("/admin/orders");

    return {
      success: successCount > 0,
      message:
        failCount === 0
          ? `All ${successCount} orders processed successfully`
          : `${successCount} processed, ${failCount} failed`,
      results: updateResults,
    };
  } catch (error: any) {
    console.error("[Admin] Bulk process orders error:", error);
    return { success: false, message: error.message, results: [] };
  }
}

/**
 * Track multiple shipments at once
 * Uses GIG POST /track/multipleMobileShipment
 */
export async function trackOrderShipments(waybills: string[]): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> {
  try {
    await requireAdmin();

    if (!waybills.length) {
      return { success: false, message: "No waybills provided" };
    }

    const result = await gigShipmentService.trackMultipleShipments(waybills);

    if (result && result.status === 200 && result.data) {
      return { success: true, data: result.data };
    }

    return {
      success: false,
      message: result?.message || "Failed to track shipments",
    };
  } catch (error: any) {
    console.error("[Admin] Track shipments error:", error);
    return {
      success: false,
      message: error.message || "Failed to track shipments",
    };
  }
}

/**
 * Look up shipment details by waybill number
 * Uses GIG /get/preshipment endpoint
 */
export async function lookupWaybill(waybill: string): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> {
  try {
    await requireAdmin();

    if (!waybill?.trim()) {
      return { success: false, message: "Waybill number is required" };
    }

    const result = await gigShipmentService.getPreshipmentByWaybill(
      waybill.trim(),
    );

    if (result && result.status === 200 && result.data) {
      return { success: true, data: result.data };
    }

    return {
      success: false,
      message: result?.message || "Shipment not found",
    };
  } catch (error: any) {
    console.error("[Admin] Waybill lookup error:", error);
    return {
      success: false,
      message: error.message || "Failed to look up waybill",
    };
  }
}
