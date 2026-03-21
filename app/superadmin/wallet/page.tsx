import WalletChargeClient from "@/components/superadmin/wallet-charge-client";

export default function SuperAdminWalletPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wallet Charge</h1>
        <p className="mt-1 text-gray-600">
          Debit the merchant wallet for class subscriptions using the required
          GIG payload.
        </p>
      </div>
      <WalletChargeClient />
    </div>
  );
}
