"use client";
import React from "react";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { verifyPayment } from "@/actions/verify-payment";

function VerifyPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState<string>("");
  const [orderId, setOrderId] = useState<string | null>(null);

  // Prevent double verification
  const hasVerifiedRef = React.useRef<string | null>(null);
  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const reference = searchParams.get("reference") || orderId;

    if (!orderId || !reference) {
      setStatus("error");
      setMessage("Missing order information");
      return;
    }

    // Only verify if not already done for this order/reference
    const key = `${orderId}:${reference}`;
    if (hasVerifiedRef.current === key) return;
    hasVerifiedRef.current = key;

    const verify = async () => {
      try {
        const result = await verifyPayment(orderId, reference);

        if (result.success) {
          setStatus("success");
          setMessage(result.message || "Payment verified successfully!");
          setOrderId(result.orderId || null);
        } else {
          setStatus("error");
          setMessage(result.message || "Payment verification failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("An unexpected error occurred");
      }
    };

    verify();
  }, [searchParams]);

  return (
    <MaxWidthWrapper className="py-20 flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md">
        <Card className="bg-card text-card-foreground">
          <CardHeader className="text-center">
            <CardTitle>
              {status === "loading" && "Verifying Payment..."}
              {status === "success" && "Payment Successful!"}
              {status === "error" && "Payment Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            {status === "loading" && (
              <Loader2 className="h-16 w-16 animate-spin text-accent-blue" />
            )}

            {status === "success" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                <CheckCircle className="h-16 w-16 text-green-500" />
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                <XCircle className="h-16 w-16 text-red-500" />
              </motion.div>
            )}

            <p className="text-center text-muted-foreground">{message}</p>

            {status === "success" && (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
                {orderId && (
                  <Button className="flex-1 text-foreground" asChild>
                    <Link href={`/profile/orders/${orderId}`}>View Order</Link>
                  </Button>
                )}
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push("/checkout")}>
                  Try Again
                </Button>
                <Button className="flex-1" asChild>
                  <Link href="/products">Back to Store</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </MaxWidthWrapper>
  );
}

export default function VerifyPaymentPage() {
  return (
    <Suspense
      fallback={
        <MaxWidthWrapper className="py-20 flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
        </MaxWidthWrapper>
      }>
      <VerifyPaymentContent />
    </Suspense>
  );
}
