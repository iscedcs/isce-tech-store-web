"use server";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { checkoutFormSchema } from "@/lib/schemas";
import { z } from "zod";
import { createTransaction } from "./paystack";
import { deliveryOptions } from "@/lib/utils";

export async function submitCheckout({
  formData,
  cartItems,
}: {
  formData: z.infer<typeof checkoutFormSchema>;
  cartItems: Array<{
    id: string;
    slug: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    customization?: {
      customizationFee?: number;
      designServiceFee?: number;
      cardColor?: string | null;
      frontDesignUrl?: string | null;
      backDesignUrl?: string | null;
    };
  }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "User not authenticated" };
  }

  if (!session.user.accessToken) {
    console.error("No accessToken found in session");
    return { success: false, message: "Missing authentication token" };
  }

  const validatedFields = checkoutFormSchema.safeParse(formData);
  if (!validatedFields.success) {
    return { success: false, message: "Invalid form data" };
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    city,
    state,
    deliveryMethod,
    pickupLocation,
  } = validatedFields.data;

  try {
    if (!cartItems || cartItems.length === 0) {
      return { success: false, message: "Cart is empty" };
    }

    // Calculate totals
    const totalWithCustomization = cartItems.reduce((total, item) => {
      const itemTotal =
        item.price * item.quantity +
        (item.customization?.customizationFee || 0) * item.quantity +
        (item.customization?.designServiceFee || 0) * item.quantity;
      return total + itemTotal;
    }, 0);

    const vatAmount = totalWithCustomization * 0.075;
    const selectedDelivery = deliveryOptions.find(
      (option) => option.id === deliveryMethod,
    );

    const deliveryPrice = selectedDelivery?.price || 0;
    const totalAmount = totalWithCustomization + vatAmount + deliveryPrice;

    console.log("Checkout calculations:", {
      totalWithCustomization,
      vatAmount,
      deliveryPrice,
      totalAmount,
      cartItems,
    });

    // Validate product stock and get product IDs
    const productMap = new Map<string, { id: string; deviceType: string }>();
    for (const item of cartItems) {
      const product = await db.product.findUnique({
        where: { slug: item.slug },
      });
      if (!product) {
        return { success: false, message: `Product ${item.name} not found` };
      }
      if (product.stock < item.quantity) {
        return {
          success: false,
          message: `Insufficient stock for ${item.name}`,
        };
      }
      productMap.set(item.slug, {
        id: product.id,
        deviceType: product.deviceType,
      });
    }

    const firstProduct = productMap.get(cartItems[0].slug);
    const deviceType = firstProduct?.deviceType || "CARD";
    const reference = `${session.user.id}-${Date.now()}`;

    // Store pending order data
    const pendingOrder = {
      userId: session.user.id,
      email,
      totalAmount,
      vatAmount,
      deliveryPrice,
      deviceType,
      transactionId: reference,
      orderItems: cartItems.map((item) => ({
        productId: productMap.get(item.slug)!.id,
        quantity: item.quantity,
        unitPrice: item.price,
        customizationFee: item.customization?.customizationFee || 0,
        designServiceFee: item.customization?.designServiceFee || 0,
        cardColor: item.customization?.cardColor || null,
        frontDesignUrl: item.customization?.frontDesignUrl || null,
        backDesignUrl: item.customization?.backDesignUrl || null,
      })),
      shippingInfo: {
        userId: session.user.id,
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        deliveryMethod,
        pickupLocation: pickupLocation || null,
      },
    };

    // Initialize Paystack transaction
    const payload = {
      email,
      amount: Math.round(totalAmount * 100), // Paystack expects amount in kobo
      currency: "NGN",
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_URL}/checkout/verify?orderId=${reference}`,
      metadata: {
        custom_fields: [
          {
            display_name: "Order Reference",
            variable_name: "order_ref",
            value: reference,
          },
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: `${firstName} ${lastName}`,
          },
          {
            display_name: "Total Amount",
            variable_name: "total_amount",
            value: totalAmount,
          },
          {
            display_name: "Items",
            variable_name: "items",
            value: cartItems
              .map((item) => `${item.name} (x${item.quantity})`)
              .join(", "),
          },
        ],
      },
    };

    const transactionResponse = await createTransaction({ payload });
    if (transactionResponse.error) {
      return { success: false, message: transactionResponse.error };
    }

    // Store pending order with retry logic
    let attempts = 0;
    const maxAttempts = 5;
    while (attempts < maxAttempts) {
      try {
        await db.pendingOrder.create({
          data: {
            reference,
            data: pendingOrder,
          },
        });
        break;
      } catch (error) {
        attempts++;
        console.error(
          `Attempt ${attempts} to store pending order failed:`,
          error,
        );
        if (attempts === maxAttempts) {
          return {
            success: false,
            message: "Failed to store pending order after multiple attempts",
          };
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return {
      success: true,
      authorization_url: transactionResponse.data.authorization_url,
      reference,
    };
  } catch (error) {
    console.error("Checkout error:", error);
    return { success: false, message: "Failed to initialize checkout" };
  } finally {
    await db.$disconnect();
  }
}
