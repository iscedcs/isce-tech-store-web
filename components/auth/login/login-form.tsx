"use client";

import { CardWrapper } from "./card-wrapper";
import { FormInput } from "./form-input";
import { Button } from "../../ui/button";
import Link from "next/link";


interface AuthFormProps {
  type: "login" | "register";
} 


export const AuthForm = ({ type }: AuthFormProps) => {
  const isLogin = type === "login";
  return (
    <CardWrapper
      headerTitle={isLogin ? "Welcome Back" : "Join ISCE"}
      headerSubtitle={
        isLogin
          ? "Sign in to continue shopping"
          : "Join the ISCE ecosystem-- shop innovation, live smart"
      }
      backButtonLabel1={
        isLogin
          ? "Don't have an account?"
          : "Already have an account?"
      }
      backButtonLabel2= {
        isLogin
          ? " Sign Up"
          : " Sign In"
      }
      backButtonHref={isLogin ? "/register" : "/login"}
      showSocial
    >
      {!isLogin && (
              <FormInput
                label="Full Name"
                type="text"
                placeholder="John Doe"
              />
            )}
      
            {/* Shared */}
            <FormInput
              label="Email Address"
              type="email"
              placeholder="you@example.com"
            />
      
            <FormInput
              label="Password"
              type="password"
              placeholder="********"
            />
      
            {/* Register Only */}
            {!isLogin && (
              <FormInput
                label="Confirm Password"
                type="password"
                placeholder="********"
              />
            )}
      
            {/* Login Only */}
            {isLogin && (
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            )}
      
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-lg">
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
    </CardWrapper>
  );
};