import { auth } from "@/auth";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

export default async function ProfileDashboard() {
  const session = await auth();
  const orders = await getUserOrders(session?.user?.id || "");
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session?.user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your account and view your orders
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-gray-600">Total Orders</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {orders.length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm font-medium text-gray-600">Delivered Orders</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {orders.filter((o: any) => o.status === "DELIVERED").length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm font-medium text-gray-600">Active Orders</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {
              orders.filter((o: any) =>
                ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(
                  o.status,
                ),
              ).length
            }
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          {orders.length > 5 && (
            <Link
              href="/profile/orders"
              className="text-accent-blue hover:underline text-sm">
              View All
            </Link>
          )}
        </div>

        {recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order: any) => (
              <Link
                key={order.id}
                href={`/profile/orders/${order.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-accent-blue transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Order #{order.id.substring(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={statusColors[order.status] || ""}>
                      {order.status}
                    </Badge>
                    <p className="font-semibold text-gray-900 mt-2">
                      {formatCurrency(order.totalAmount)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-gray-200 rounded-lg">
            <p className="text-gray-500 mb-4">No orders yet</p>
            <Link
              href="/products"
              className="inline-block bg-accent-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
