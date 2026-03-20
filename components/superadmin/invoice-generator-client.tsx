"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ExternalLink, FileText } from "lucide-react";

import { generateWaybillInvoice } from "@/actions/superadmin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function InvoiceGeneratorClient() {
  const [waybill, setWaybill] = useState("");
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateWaybillInvoice(waybill);
      if (!result.success || !result.data?.WaybillLabel) {
        toast.error(result.message || "Failed to generate invoice");
        setInvoiceUrl(null);
        return;
      }

      setInvoiceUrl(result.data.WaybillLabel);
      toast.success(result.message || "Invoice generated");
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Generate Invoice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={waybill}
              onChange={(event) => setWaybill(event.target.value)}
              placeholder="Enter waybill number"
              className="flex-1"
            />
            <Button
              onClick={handleGenerate}
              disabled={isPending || !waybill.trim()}
              className="text-foreground">
              {isPending ? "Generating..." : "Generate Invoice"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {invoiceUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <a
              href={invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700 hover:underline">
              <ExternalLink className="h-4 w-4" />
              Open Invoice PDF
            </a>
            <iframe
              src={invoiceUrl}
              className="h-175 w-full rounded-lg border"
              title="Invoice preview"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
