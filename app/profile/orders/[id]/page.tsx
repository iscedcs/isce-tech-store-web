import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, CheckCircle, Clock, Truck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import OrderTracking from "@/components/profile/order-tracking";
import { db } from "@/lib/prisma";

async function getOrderDetails(orderId: string, userId: string) {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { product: true } },
        shippingInfo: true,
      },
    });
    if (!order || order.userId !== userId) return null;
    return order;
  } catch (error) {
    console.error("Failed to fetch order details:", error);
    return null;
  }
}

const statusSteps = [
  { status: "PENDING", label: "Order Placed", icon: Clock },
  { status: "CONFIRMED", label: "Confirmed", icon: CheckCircle },
  { status: "PROCESSING", label: "Processing", icon: Clock },
  { status: "SHIPPED", label: "Shipped", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: CheckCircle },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const order = await getOrderDetails(id, session?.user?.id || "");

  if (!order) {
    notFound();
  }

  const currentStepIndex = statusSteps.findIndex(
    (step) => step.status === order.status,
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/profile/orders"
          className="flex items-center gap-2 text-accent-blue hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Order #{id.substring(0, 8).toUpperCase()}
        </h1>
        <p className="text-gray-600 mt-2">
          Placed on{" "}
          {new Date(order.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Order Status Timeline */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="flex items-center mb-6">
          <Badge className={statusColors[order.status] || "text-foreground"}>
            {order.status}
          </Badge>
        </div>

        {order.status !== "CANCELLED" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Order Progress</h3>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.status} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? "bg-accent-blue text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p
                      className={`text-xs font-medium mt-2 text-center max-w-16 ${
                        isCurrent ? "text-accent-blue" : "text-gray-600"
                      }`}>
                      {step.label}
                    </p>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`h-1 w-8 mt-4 rounded-full ${
                          isCompleted && index < currentStepIndex
                            ? "bg-accent-blue"
                            : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Order Items ({order.orderItems?.length || 0})
        </h2>
        <div className="space-y-3 border border-gray-200 rounded-lg overflow-hidden">
          {order.orderItems?.map((item: any) => (
            <div
              key={item.id}
              className="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {item.product?.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Quantity: {item.quantity}
                  </p>
                  {item.cardColor && (
                    <p className="text-sm text-gray-600">
                      Color: {item.cardColor}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(item.unitPrice)} each
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Order Summary
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal</span>
            <span>
              {formatCurrency(
                (order.totalAmount || 0) -
                  (order.vatAmount || 0) -
                  (order.deliveryPrice || 0),
              )}
            </span>
          </div>
          {order.vatAmount > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>VAT</span>
              <span>{formatCurrency(order.vatAmount)}</span>
            </div>
          )}
          {order.deliveryPrice > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Delivery Fee</span>
              <span>{formatCurrency(order.deliveryPrice)}</span>
            </div>
          )}
          <div className="border-t border-gray-300 pt-3 flex justify-between font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Info */}
      {order.shippingInfo && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {order.shippingInfo.deliveryMethod === "pickup"
              ? "Pickup Location"
              : "Delivery Address"}
          </h2>
          <div className="space-y-2 text-gray-700">
            <p className="font-medium">
              {order.shippingInfo.firstName} {order.shippingInfo.lastName}
            </p>
            {order.shippingInfo.deliveryMethod === "pickup" ? (
              <>
                {order.shippingInfo.pickupLocationName && (
                  <p>{order.shippingInfo.pickupLocationName}</p>
                )}
                <p>
                  {order.shippingInfo.pickupLocationAddress ||
                    order.shippingInfo.address}
                </p>
              </>
            ) : (
              <>
                <p>{order.shippingInfo.address}</p>
                <p>
                  {order.shippingInfo.city}, {order.shippingInfo.state}
                </p>
              </>
            )}
            <p>{order.shippingInfo.phone}</p>
            <p>{order.shippingInfo.email}</p>
          </div>
        </div>
      )}

      {/* Shipment Tracking */}
      {order.shipmentId && <OrderTracking waybill={order.shipmentId} />}
    </div>
  );
}
