import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/login/forgot-password-form";

function FormFallback() {
  return (
    <div className="w-full max-w-md p-6 bg-[#1A2130] rounded-lg animate-pulse">
      <div className="h-8 bg-gray-600 rounded mb-4" />
      <div className="h-10 bg-gray-600 rounded mb-3" />
      <div className="h-10 bg-gray-600 rounded" />
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0E1622] to-[#0B111A]">
      <Suspense fallback={<FormFallback />}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
