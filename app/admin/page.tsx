import { db } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

async function getAdminStats() {
  const [
    totalOrders,
    paidOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue,
    recentOrders,
  ] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { status: "PAID" } }),
    db.order.count({ where: { status: "PROCESSING" } }),
    db.order.count({ where: { status: "SHIPPED" } }),
    db.order.count({ where: { status: "DELIVERED" } }),
    db.order.count({ where: { status: "CANCELLED" } }),
    db.order.aggregate({ _sum: { totalAmount: true } }),
    db.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: { include: { product: true } },
        shippingInfo: true,
      },
    }),
  ]);

  return {
    totalOrders,
    paidOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    recentOrders,
  };
}

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: "bg-gray-100 text-gray-800",
  PAID: "bg-blue-100 text-blue-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  FAILED: "bg-red-100 text-red-800",
};

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const statCards = [
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: Package,
      color: "bg-blue-50 border-blue-200 text-blue-600",
    },
    {
      label: "Paid (Awaiting)",
      value: stats.paidOrders,
      icon: CreditCard,
      color: "bg-yellow-50 border-yellow-200 text-yellow-600",
    },
    {
      label: "Processing",
      value: stats.processingOrders,
      icon: Clock,
      color: "bg-purple-50 border-purple-200 text-purple-600",
    },
    {
      label: "Shipped",
      value: stats.shippedOrders,
      icon: Truck,
      color: "bg-indigo-50 border-indigo-200 text-indigo-600",
    },
    {
      label: "Delivered",
      value: stats.deliveredOrders,
      icon: CheckCircle,
      color: "bg-green-50 border-green-200 text-green-600",
    },
    {
      label: "Cancelled",
      value: stats.cancelledOrders,
      icon: XCircle,
      color: "bg-red-50 border-red-200 text-red-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your store</p>
      </div>

      {/* Revenue */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Total Revenue</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">
          {formatCurrency(stats.totalRevenue)}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`p-3 sm:p-4 rounded-lg border ${card.color}`}>
              <Icon className="w-4 sm:w-5 h-4 sm:h-5 mb-2" />
              <p className="text-lg sm:text-2xl font-bold">{card.value}</p>
              <p className="text-xs font-medium mt-1 opacity-80">
                {card.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs sm:text-sm text-accent-blue hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Order
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Customer
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">
                  Items
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">
                  Total
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.shippingInfo
                      ? `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={statusColors[order.status] || ""}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.orderItems.length}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
