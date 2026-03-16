"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { verifyTransaction } from "./paystack";
import { auth } from "@/auth";
import { DeviceType } from "@prisma/client";

export async function verifyPayment(orderId: string, reference: string) {
  const session = await auth();

  if (!reference || !orderId) {
    console.error("Missing order ID or transaction reference");
    return { success: false, message: "Missing required parameters" };
  }

  try {
    const result = await verifyTransaction(reference);
    console.log("Verification result:", result);

    if (result.error) {
      console.error("Error verifying transaction:", result.error);
      await db.pendingOrder.delete({ where: { reference } }).catch(() => {});
      return { success: false, message: result.error };
    }

    const pendingOrder = await db.pendingOrder.findUnique({
      where: { reference },
    });

    if (!pendingOrder) {
      console.error("Pending order not found for reference:", reference);
      return { success: false, message: "Order not found" };
    }

    if (typeof pendingOrder.data !== "object" || !pendingOrder.data) {
      console.error("Pending order data is invalid");
      return { success: false, message: "Invalid order data" };
    }

    const orderData = pendingOrder.data as {
      userId: string;
      email: string;
      totalAmount: number;
      vatAmount: number;
      deliveryPrice: number;
      deviceType: DeviceType;
      transactionId: string;
      orderItems: Array<{
        productId: string;
        quantity: number;
        unitPrice: number;
        customizationFee: number;
        designServiceFee: number;
        cardColor: string | null;
        frontDesignUrl: string | null;
        backDesignUrl: string | null;
      }>;
      shippingInfo: {
        userId: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        deliveryMethod: string;
        pickupLocation: string | null;
      };
    };

    // Create order in transaction
    const order = await db.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          id: orderId,
          userId: orderData.userId,
          totalAmount: orderData.totalAmount,
          vatAmount: orderData.vatAmount,
          deliveryPrice: orderData.deliveryPrice,
          deviceType: orderData.deviceType,
          status: "PAID",
          transactionId: reference,
          orderItems: {
            create: orderData.orderItems,
          },
          shippingInfo: {
            create: orderData.shippingInfo,
          },
        },
        include: { orderItems: true, shippingInfo: true },
      });

      // Update stock
      for (const item of orderData.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return createdOrder;
    });

    const confirmOrder = await db.order.findUnique({
      where: { id: order.id },
      select: { id: true },
    });

    if (!confirmOrder) {
      console.error(`Order ${order.id} not found after creation`);
      return { success: false, message: "Order creation failed" };
    }

    // Call ISCE Auth to request device tokens
    const AUTH_API =
      process.env.ISCE_AUTH_BACKEND_URL ||
      "https://stingray-app-clk8t.ondigitalocean.app";

    for (const item of orderData.orderItems) {
      const payload = {
        email: orderData.email || session?.user?.email,
      };

      // Request a token for each unit purchased
      for (let i = 0; i < item.quantity; i++) {
        try {
          const response = await fetch(`${AUTH_API}/device/request-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.user?.accessToken}`,
            },
            body: JSON.stringify(payload),
          });

          const logDetails = {
            status: response.status,
            body: await response.text(),
          };

          if (!response.ok) {
            console.error(
              `Failed to request device token ${i + 1}/${item.quantity} for product ${item.productId}:`,
              logDetails,
            );
          } else {
            console.log(
              `Successfully requested device token ${i + 1}/${item.quantity} for product ${item.productId}:`,
              logDetails,
              `kindly check your email`,
            );
          }
        } catch (error) {
          console.error(
            `Error sending request to ISCE Auth for device token ${item.productId}:`,
            error,
          );
        }
      }
    }

    // Clean up pending order
    await db.pendingOrder.delete({ where: { reference } });

    revalidatePath(`/orders`);
    return {
      success: true,
      message: "Transaction verified",
      orderId: order.id,
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return { success: false, message: "Error verifying transaction" };
  }
}
