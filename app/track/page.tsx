"use client";

import { MapPinned, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import OrderTracking from "@/components/profile/order-tracking";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function TrackShipmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeWaybill = searchParams.get("waybill")?.trim() ?? "";
  const [waybillInput, setWaybillInput] = useState(activeWaybill);

  useEffect(() => {
    setWaybillInput(activeWaybill);
  }, [activeWaybill]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextWaybill = waybillInput.trim();
    if (!nextWaybill) {
      return;
    }

    router.push(`/track?waybill=${encodeURIComponent(nextWaybill)}`);
  };

  return (
    <MaxWidthWrapper className="py-16 sm:py-20 min-h-screen">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-3 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent-blue/10 text-accent-blue">
            <MapPinned className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Track Your Shipment
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
            Enter your waybill number to view the latest delivery updates for
            your order.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Waybill Lookup</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={waybillInput}
                onChange={(event) => setWaybillInput(event.target.value)}
                placeholder="Enter your waybill number"
                className="flex-1"
              />
              <Button type="submit" className="sm:w-auto text-foreground">
                <Search className="mr-2 h-4 w-4" />
                Track Shipment
              </Button>
            </form>
          </CardContent>
        </Card>

        {activeWaybill ? (
          <OrderTracking waybill={activeWaybill} autoFetch />
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Shipment details will appear here once you search with a valid
              waybill.
            </CardContent>
          </Card>
        )}
      </div>
    </MaxWidthWrapper>
  );
}
