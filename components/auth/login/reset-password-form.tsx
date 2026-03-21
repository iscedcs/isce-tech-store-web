"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { CardWrapper } from "./card-wrapper";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { PadlockIcon } from "@/lib/icons";
import { Eye, EyeOff } from "lucide-react";
import { newPasswordSchema, NewPasswordValues } from "@/lib/schemas";
import { resetPassword } from "@/actions/reset-password";
import { toast } from "sonner";

export const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState(token);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: NewPasswordValues) => {
    const activeCode = code.trim();
    if (!activeCode) {
      setError("Reset code is required");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await resetPassword(values, activeCode);
      if (result.success) {
        toast.success(result.message);
        router.push("/login");
      } else {
        setError(result.error || "Something went wrong");
        toast.error(result.error || "Something went wrong");
      }
    });
  };

  return (
    <CardWrapper
      headerTitle="Reset Password"
      headerSubtitle="Enter the 6-digit code from your email and set a new password"
      backButtonLabel1="Remember your password?"
      backButtonLabel2=" Sign In"
      backButtonHref="/login"
      showSocial={false}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Code field */}
        <div className="space-y-2">
          <Label className="text-sm text-black">Reset Code</Label>
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            disabled={isPending}
            className="h-11 rounded-lg bg-(--inputcol) placeholder:text-primary text-primary border border-(--inputbor) text-center text-lg tracking-[0.3em] font-semibold"
          />
          {!code.trim() && (
            <p className="text-xs text-gray-500">
              Enter the 6-digit code sent to your email
            </p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <Label className="text-sm text-black">New Password</Label>
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
              <PadlockIcon />
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              disabled={isPending}
              className="h-11 rounded-lg bg-(--inputcol) border border-(--inputbor) placeholder:text-primary text-black pl-10 pr-10"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label className="text-sm text-black">Confirm Password</Label>
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
              <PadlockIcon />
            </div>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="********"
              disabled={isPending}
              className="h-11 rounded-lg bg-(--inputcol) placeholder:text-primary text-primary border border-(--inputbor) pl-10 pr-10"
              {...form.register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-red-500">
              {form.formState.errors.confirmPassword.message}
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
          disabled={isPending || !code.trim()}
          className="w-full bg-(--buttcol) hover:bg-secondary-foreground text-foreground h-11 rounded-lg">
          {isPending ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </CardWrapper>
  );
};
