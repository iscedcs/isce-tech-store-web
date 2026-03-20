import Link from "next/link";
import { Building2, FileText, Wallet } from "lucide-react";

import { getSuperAdminWalletSummary } from "@/actions/superadmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SuperAdminDashboardPage() {
  const walletSummary = await getSuperAdminWalletSummary();

  const cards = [
    {
      title: "Company Information",
      description: "Look up merchant company details by email address.",
      href: "/superadmin/company",
      icon: Building2,
    },
    {
      title: "Charge Wallet",
      description: "Apply class subscription wallet charges using BillType 0.",
      href: "/superadmin/wallet",
      icon: Wallet,
    },
    {
      title: "Invoices",
      description: "Generate and preview waybill invoice PDFs.",
      href: "/superadmin/invoices",
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Superadmin Dashboard
        </h1>
        <p className="mt-1 text-gray-600">
          Business controls for company details, wallet charging, and invoice
          generation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Merchant Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">
            {walletSummary.success
              ? (walletSummary.balance?.toLocaleString() ?? "0")
              : "Unavailable"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {walletSummary.success
              ? "Current wallet balance from GIG."
              : walletSummary.message || "Unable to retrieve wallet balance."}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="h-full border-gray-200 transition hover:border-indigo-300 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="h-5 w-5 text-indigo-600" />
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{card.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
