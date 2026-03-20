"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

import { chargeMerchantWallet } from "@/actions/superadmin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function WalletChargeClient() {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    userId: "",
    amount: "",
    referenceNo: "",
    description: "",
  });

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await chargeMerchantWallet({
        userId: form.userId,
        amount: Number(form.amount),
        referenceNo: form.referenceNo,
        description: form.description,
      });

      if (!result.success) {
        toast.error(result.message || "Failed to charge wallet");
        return;
      }

      toast.success(result.message || "Wallet charged successfully");
      setForm({ userId: "", amount: "", referenceNo: "", description: "" });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-indigo-600" />
          Charge Merchant Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-900">
          Bill type is fixed to <strong>0</strong> for class subscription
          charges.
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={form.userId}
              onChange={(e) => updateField("userId", e.target.value)}
              placeholder="e1e09dac-e6c2-45e3-8faf-5be37ae05af6"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              value={form.amount}
              onChange={(e) => updateField("amount", e.target.value)}
              placeholder="10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reference">Reference Number</Label>
          <Input
            id="reference"
            value={form.referenceNo}
            onChange={(e) => updateField("referenceNo", e.target.value)}
            placeholder="*****234"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Class subscription charge"
            rows={4}
          />
        </div>
        <Button
          onClick={handleSubmit}
          className="text-foreground"
          disabled={isPending}>
          {isPending ? "Charging..." : "Charge Wallet"}
        </Button>
      </CardContent>
    </Card>
  );
}
