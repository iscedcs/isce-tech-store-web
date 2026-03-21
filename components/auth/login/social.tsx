"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Social = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/profile";
  const oauthError = searchParams.get("error");
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  useEffect(() => {
    if (!oauthError) return;

    if (oauthError === "OAuthAccountNotLinked") {
      toast.error(
        "This email already exists. Sign in with password first, then connect Google from profile settings.",
      );
      return;
    }

    if (oauthError === "AccessDenied") {
      toast.error("Google sign-in was cancelled or denied.");
      return;
    }

    toast.error("Google sign-in failed. Please try again.");
  }, [oauthError]);

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true);

    try {
      const response = await signIn("google", {
        callbackUrl,
        redirect: false,
      });

      if (response?.error) {
        toast.error("Google sign-in failed. Please try again.");
      }

      if (response?.url) {
        window.location.href = response.url;
      }
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full gap-2">
      <div className="flex items-center gap-4 w-full my-6">
        <div className="flex-1 h-px bg-secondary-gray"></div>
        <span className="text-primary text-sm font-medium whitespace-nowrap">
          Or Continue with
        </span>
        <div className="flex-1 h-px bg-secondary-gray"></div>
      </div>
      <div className="w-full">
        <button
          type="button"
          disabled={isLoadingGoogle}
          className="w-full flex items-center cursor-pointer justify-center gap-2 bg-primary text-foreground rounded-lg py-3 px-4 hover:bg-gray disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={handleGoogleSignIn}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M13.8921 6.37H7.29841V8.281H11.9795C11.7422 10.948 9.46276 12.089 7.3056 12.089C4.55162 12.089 2.13559 9.975 2.13559 7C2.13559 4.13 4.43657 1.911 7.31279 1.911C9.53467 1.911 10.8362 3.29 10.8362 3.29L12.2024 1.904C12.2024 1.904 10.4479 0 7.24088 0C3.15665 0 0 3.36 0 7C0 10.535 2.9697 14 7.34874 14C11.1957 14 14 11.431 14 7.637C14 6.832 13.8921 6.37 13.8921 6.37Z"
              fill="white"
            />
          </svg>
          <span className="text-sm font-medium">
            {isLoadingGoogle ? "Loading..." : "Google"}
          </span>
        </button>
      </div>
    </div>
  );
};
