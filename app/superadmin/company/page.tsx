import CompanyInfoClient from "@/components/superadmin/company-info-client";

export default function SuperAdminCompanyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Company Details</h1>
        <p className="mt-1 text-gray-600">
          Fetch and inspect company information from GIG by merchant email.
        </p>
      </div>
      <CompanyInfoClient />
    </div>
  );
}
