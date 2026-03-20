import InvoiceGeneratorClient from "@/components/superadmin/invoice-generator-client";

export default function SuperAdminInvoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="mt-1 text-gray-600">
          Generate invoice PDFs from GIG using a waybill number and preview them
          in-app.
        </p>
      </div>
      <InvoiceGeneratorClient />
    </div>
  );
}
