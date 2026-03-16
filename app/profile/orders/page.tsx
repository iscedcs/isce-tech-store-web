import { auth } from "@/auth";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

async function getUserOrders(userId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/user/orders`,
      {
        headers: {
          "x-user-id": userId,
        },
        cache: "no-store",
      },
    );
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function OrdersPage() {
  const session = await auth();
  const orders = await getUserOrders(session?.user?.id || "");

  // Group orders by status
  const pendingOrders = orders.filter((o: any) =>
    ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(o.status),
  );
  const completedOrders = orders.filter((o: any) => o.status === "DELIVERED");
  const cancelledOrders = orders.filter((o: any) => o.status === "CANCELLED");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-2">
          Track and manage your orders in one place
        </p>
      </div>

      {/* Active Orders */}
      {pendingOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Active Orders ({pendingOrders.length})
          </h2>
          <div className="space-y-3">
            {pendingOrders.map((order: any) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Orders */}
      {completedOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Delivered Orders ({completedOrders.length})
          </h2>
          <div className="space-y-3">
            {completedOrders.map((order: any) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}

      {/* Cancelled Orders */}
      {cancelledOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Cancelled Orders ({cancelledOrders.length})
          </h2>
          <div className="space-y-3">
            {cancelledOrders.map((order: any) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="text-center py-12 border border-gray-200 rounded-lg">
          <p className="text-gray-500 mb-6 text-lg">No orders yet</p>
          <Link href="/products">
            <Button className="bg-accent-blue text-white hover:bg-blue-700">
              Continue Shopping
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-purple-100 text-purple-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <Link href={`/profile/orders/${order.id}`}>
      <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-accent-blue transition-all cursor-pointer hover:bg-gray-50">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <p className="font-semibold text-gray-900">
                Order #{order.id.substring(0, 8).toUpperCase()}
              </p>
              <Badge className={statusColors[order.status] || ""}>
                {order.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-sm text-gray-600">
              {order.orderItems?.length || 0} item
              {order.orderItems?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900 text-lg">
              {formatCurrency(order.totalAmount)}
            </p>
            <ArrowRight className="w-5 h-5 text-gray-400 mt-2 ml-auto" />
          </div>
        </div>
      </div>
    </Link>
  );
}
