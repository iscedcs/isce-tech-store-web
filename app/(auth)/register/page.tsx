import { Suspense } from "react";
import { AuthForm } from "@/components/auth/login/login-form";

function AuthFormFallback() {
  return (
    <div className="w-full max-w-md p-6 bg-[#1A2130] rounded-lg animate-pulse">
      <div className="h-8 bg-gray-600 rounded mb-4" />
      <div className="h-10 bg-gray-600 rounded mb-3" />
      <div className="h-10 bg-gray-600 rounded mb-3" />
      <div className="h-10 bg-gray-600 rounded" />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0E1622] to-[#0B111A]">
      <Suspense fallback={<AuthFormFallback />}>
        <AuthForm type="register" />
      </Suspense>
    </div>
  );
}
