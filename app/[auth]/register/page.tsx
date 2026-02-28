import { AuthForm } from "@/components/auth/login/login-form";


export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0E1622] to-[#0B111A]">
      <AuthForm type="register" />
    </div>
  );
}