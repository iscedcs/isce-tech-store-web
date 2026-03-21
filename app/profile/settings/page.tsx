"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const googleLinked = searchParams.get("googleLinked");
    const oauthError = searchParams.get("error");

    if (googleLinked === "1") {
      toast.success("Google account connected successfully.");
    }

    if (oauthError === "OAuthAccountNotLinked") {
      toast.error(
        "Google account is already linked to another login method. Please sign in with your password first.",
      );
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    firstName: session?.user?.firstName || "",
    lastName: session?.user?.lastName || "",
    email: session?.user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Profile updated successfully" });
      } else {
        setMessage({
          type: "error",
          text: "Failed to update profile. Please try again.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Password changed successfully",
        });
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        const data = await response.json();
        setMessage({
          type: "error",
          text: data.message || "Failed to change password",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLink = async () => {
    setIsLinkingGoogle(true);

    try {
      const callbackUrl = "/profile/settings?googleLinked=1";
      const response = await signIn("google", {
        callbackUrl,
        redirect: false,
      });

      if (response?.error) {
        toast.error("Unable to connect Google account. Please try again.");
      }

      if (response?.url) {
        window.location.href = response.url;
        return;
      }
    } catch {
      toast.error("Unable to connect Google account. Please try again.");
    } finally {
      setIsLinkingGoogle(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account and security settings
        </p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}>
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Profile Information */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Profile Information
        </h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-accent-blue text-white hover:bg-blue-700">
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>

      {/* Change Password */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <Input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="w-full"
              placeholder="Enter your current password"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <Input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full "
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Password must be at least 8 characters long
          </p>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-accent-blue text-white hover:bg-blue-700">
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>

      <div className="border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Connected Accounts
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Link Google to this account for faster sign-in.
        </p>
        <Button
          type="button"
          onClick={handleGoogleLink}
          disabled={isLinkingGoogle}
          className="bg-accent-blue text-white hover:bg-blue-700">
          {isLinkingGoogle ? "Connecting..." : "Connect Google"}
        </Button>
      </div>
    </div>
  );
}
