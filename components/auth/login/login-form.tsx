"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { CardWrapper } from "./card-wrapper";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import Link from "next/link";
import {
  EmailIcon,
  PadlockIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
} from "@/lib/icons";
import {
  loginFormSchema,
  signUpFormSchema,
  LoginFormValues,
  SignUpFormValues,
} from "@/lib/schemas";
import { login } from "@/actions/login";
import { signup } from "@/actions/sign-up";
import { toast } from "sonner";

interface AuthFormProps {
  type: "login" | "register";
}

export const AuthForm = ({ type }: AuthFormProps) => {
  const isLogin = type === "login";
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // Step 1 or 2 for registration

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Signup form
  const signupForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      dob: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (values: LoginFormValues) => {
    setError(null);
    startTransition(async () => {
      const result = await login(values, callbackUrl);

      if (result.success) {
        toast.success(result.message);
        router.push(result.redirectUrl || "/");
        router.refresh();
      } else {
        setError(result.error || "Login failed");
        toast.error(result.error || "Login failed");
      }
    });
  };

  const onSignupSubmit = async (values: SignUpFormValues) => {
    setError(null);
    startTransition(async () => {
      const result = await signup(values);

      if (result.success) {
        toast.success(result.message);
        router.push("/login");
      } else {
        setError(result.error || "Signup failed");
        toast.error(result.error || "Signup failed");
      }
    });
  };

  // Handle moving to step 2 for registration
  const handleNextStep = async () => {
    // Validate step 1 fields before moving to step 2
    const step1Valid = await signupForm.trigger([
      "fullName",
      "email",
      "phone",
      "password",
      "confirmPassword",
    ]);
    if (step1Valid) {
      setStep(2);
      setError(null);
    }
  };

  return (
    <CardWrapper
      headerTitle={
        isLogin
          ? "Welcome Back"
          : step === 1
            ? "Join ISCE"
            : "Complete Your Profile"
      }
      headerSubtitle={
        isLogin
          ? "Sign in to continue shopping"
          : step === 1
            ? "Join the ISCE ecosystem-- shop innovation, live smart"
            : "Just a few more details to get you started"
      }
      backButtonLabel1={
        isLogin ? "Don't have an account?" : "Already have an account?"
      }
      backButtonLabel2={isLogin ? " Sign Up" : " Sign In"}
      backButtonHref={isLogin ? "/register" : "/login"}
      showSocial={isLogin || step === 1}>
      <form
        onSubmit={
          isLogin
            ? loginForm.handleSubmit(onLoginSubmit)
            : signupForm.handleSubmit(onSignupSubmit)
        }
        className="space-y-4">
        {/* Step indicator for registration */}
        {!isLogin && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 1
                  ? "bg-(--buttcol) text-foreground"
                  : "bg-gray-200 text-gray-600"
              }`}>
              1
            </div>
            <div className="w-8 h-0.5 bg-gray-200" />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 2
                  ? "bg-(--buttcol) text-foreground"
                  : "bg-gray-200 text-gray-600"
              }`}>
              2
            </div>
          </div>
        )}

        {/* ========== STEP 1 FIELDS ========== */}
        {(!isLogin ? step === 1 : true) && (
          <>
            {/* Register Only - Full Name */}
            {!isLogin && (
              <div className="space-y-2">
                <Label className="text-sm text-black">Full Name</Label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    disabled={isPending}
                    className="h-11 rounded-lg bg-(--inputcol) border border-(--inputbor) pl-10"
                    {...signupForm.register("fullName")}
                  />
                </div>
                {signupForm.formState.errors.fullName && (
                  <p className="text-sm text-red-500">
                    {signupForm.formState.errors.fullName.message}
                  </p>
                )}
              </div>
            )}

            {/* Email */}
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
                  {...(isLogin
                    ? loginForm.register("email")
                    : signupForm.register("email"))}
                />
              </div>
              {isLogin
                ? loginForm.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )
                : signupForm.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
            </div>

            {/* Register Only - Phone */}
            {!isLogin && (
              <div className="space-y-2">
                <Label className="text-sm text-black">Phone Number</Label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                    <PhoneIcon className="w-4 h-4" />
                  </div>
                  <Input
                    type="tel"
                    placeholder="+234 800 000 0000"
                    disabled={isPending}
                    className="h-11 rounded-lg bg-(--inputcol) border border-(--inputbor) pl-10"
                    {...signupForm.register("phone")}
                  />
                </div>
                {signupForm.formState.errors.phone && (
                  <p className="text-sm text-red-500">
                    {signupForm.formState.errors.phone.message}
                  </p>
                )}
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-sm text-black">Password</Label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <PadlockIcon />
                </div>
                <Input
                  type="password"
                  placeholder="********"
                  disabled={isPending}
                  className="h-11 rounded-lg bg-(--inputcol) border border-(--inputbor) pl-10"
                  {...(isLogin
                    ? loginForm.register("password")
                    : signupForm.register("password"))}
                />
              </div>
              {isLogin
                ? loginForm.formState.errors.password && (
                    <p className="text-sm text-red-500">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )
                : signupForm.formState.errors.password && (
                    <p className="text-sm text-red-500">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
            </div>

            {/* Register Only - Confirm Password */}
            {!isLogin && (
              <div className="space-y-2">
                <Label className="text-sm text-black">Confirm Password</Label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                    <PadlockIcon />
                  </div>
                  <Input
                    type="password"
                    placeholder="********"
                    disabled={isPending}
                    className="h-11 rounded-lg bg-(--inputcol) border border-(--inputbor) pl-10"
                    {...signupForm.register("confirmPassword")}
                  />
                </div>
                {signupForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {signupForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            )}

            {/* Login Only - Forgot Password */}
            {isLogin && (
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-(--backtext)">
                  Forgot password?
                </Link>
              </div>
            )}
          </>
        )}

        {/* ========== STEP 2 FIELDS (Register Only) ========== */}
        {!isLogin && step === 2 && (
          <>
            {/* Date of Birth */}
            <div className="space-y-2">
              <Label className="text-sm text-black">Date of Birth</Label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <Input
                  type="date"
                  disabled={isPending}
                  className="h-11 rounded-lg bg-(--inputcol) border border-(--inputbor) pl-10"
                  {...signupForm.register("dob")}
                />
              </div>
              {signupForm.formState.errors.dob && (
                <p className="text-sm text-red-500">
                  {signupForm.formState.errors.dob.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label className="text-sm text-black">Address</Label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                  <MapPinIcon className="w-4 h-4" />
                </div>
                <Input
                  type="text"
                  placeholder="123 Main Street, Lagos"
                  disabled={isPending}
                  className="h-11 rounded-lg bg-(--inputcol) border border-(--inputbor) pl-10"
                  {...signupForm.register("address")}
                />
              </div>
              {signupForm.formState.errors.address && (
                <p className="text-sm text-red-500">
                  {signupForm.formState.errors.address.message}
                </p>
              )}
            </div>
          </>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Buttons */}
        {isLogin ? (
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-(--buttcol) hover:bg-secondary-foreground text-foreground h-11 rounded-lg">
            {isPending ? "Loading..." : "Sign In"}
          </Button>
        ) : step === 1 ? (
          <Button
            type="button"
            onClick={handleNextStep}
            disabled={isPending}
            className="w-full bg-(--buttcol) hover:bg-secondary-foreground text-foreground h-11 rounded-lg">
            Continue
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => setStep(1)}
              disabled={isPending}
              variant="outline"
              className="flex-1 h-11 rounded-lg">
              Back
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-(--buttcol) hover:bg-secondary-foreground text-foreground h-11 rounded-lg">
              {isPending ? "Creating..." : "Create Account"}
            </Button>
          </div>
        )}
      </form>
    </CardWrapper>
  );
};
