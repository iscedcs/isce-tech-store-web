"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { CardWrapper } from "./card-wrapper";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { EmailIcon } from "@/lib/icons";
import { resetPasswordSchema, ResetPasswordValues } from "@/lib/schemas";
import { sendResetToken } from "@/actions/reset-password";
import { toast } from "sonner";

export const ForgotPasswordForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    setError(null);
    startTransition(async () => {
      const result = await sendResetToken(values);
      if (result.success) {
        setSent(true);
        toast.success(result.message);
      } else {
        setError(result.error || "Something went wrong");
        toast.error(result.error || "Something went wrong");
      }
    });
  };

  return (
    <CardWrapper
      headerTitle="Forgot Password"
      headerSubtitle={
        sent
          ? "Check your email for the reset code"
          : "Enter your email to receive a reset code"
      }
      backButtonLabel1="Remember your password?"
      backButtonLabel2=" Sign In"
      backButtonHref="/login"
      showSocial={false}>
      {sent ? (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600">
            We&apos;ve sent a 6-digit reset code to{" "}
            <strong>{form.getValues("email")}</strong>. Check your inbox and
            enter the code to set a new password.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <Button
              type="button"
              onClick={() => router.push("/reset-password")}
              className="w-full bg-(--buttcol) hover:bg-secondary-foreground text-foreground h-11 rounded-lg">
              Enter Code
            </Button>
            <Button
              type="button"
              onClick={() => setSent(false)}
              variant="outline"
              className="w-full h-11 rounded-lg">
              Send Again
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-black">Email Address</Label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                <EmailIcon className="w-4 h-4" />
              </div>
              <Input
                type="email"
                placeholder="you@example.com"
                disabled={isPending}
                className="h-11 rounded-lg bg-(--inputcol) border border-(--inputbor) pl-10"
                {...form.register("email")}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-(--buttcol) hover:bg-secondary-foreground text-foreground h-11 rounded-lg">
            {isPending ? "Sending..." : "Send Reset Token"}
          </Button>
        </form>
      )}
    </CardWrapper>
  );
};
