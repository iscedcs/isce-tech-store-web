"use client";

import { Building2, Mail, Search } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { getCompanyInfoByEmail } from "@/actions/superadmin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function CompanyInfoClient() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState<any[]>([]);

  const handleLookup = () => {
    startTransition(async () => {
      const result = await getCompanyInfoByEmail(email);
      if (!result.success) {
        toast.error(result.message || "Failed to fetch company details");
        setResults([]);
        return;
      }

      setResults(result.data || []);
      toast.success(result.message || "Company details retrieved");
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-600" />
            Company Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter company email"
              className="flex-1"
            />
            <Button
              onClick={handleLookup}
              className="text-foreground"
              disabled={isPending || !email.trim()}>
              <Search className="mr-2 h-4 w-4 text-foreground" />
              {isPending ? "Looking up..." : "Fetch Details"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.map((company) => (
        <Card key={company._id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              {company.Name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Email
                </p>
                <p className="text-sm text-foreground">
                  {company.Email || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Phone
                </p>
                <p className="text-sm text-foreground">
                  {company.PhoneNumber || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Customer Code
                </p>
                <p className="text-sm text-foreground">
                  {company.CustomerCode || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Address
                </p>
                <p className="text-sm text-foreground">
                  {company.Address || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  City / State
                </p>
                <p className="text-sm text-foreground">
                  {company.City || "—"}, {company.State || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Industry
                </p>
                <p className="text-sm text-foreground">
                  {company.Industry || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Wallet Amount
                </p>
                <p className="text-sm text-foreground">
                  {company.WalletAmount ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Eligibility
                </p>
                <p className="text-sm text-foreground">
                  {company.IsEligible ? "Eligible" : "Not eligible"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Created
                </p>
                <p className="text-sm text-foreground">
                  {new Date(company.DateCreated).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
