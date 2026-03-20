"use server";

import { authApi } from "@/lib/api-client";
import { URLS } from "@/lib/const";
import {
  resetPasswordSchema,
  newPasswordSchema,
  ResetPasswordValues,
  NewPasswordValues,
} from "@/lib/schemas";

export const sendResetToken = async (values: ResetPasswordValues) => {
  const validated = resetPasswordSchema.safeParse(values);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Invalid email",
    };
  }

  const { email } = validated.data;

  const response = await authApi.post(URLS.auth.reset_token, { email });

  if (!response.success) {
    return {
      success: false,
      error: response.error || "Failed to send reset token",
    };
  }

  return {
    success: true,
    message: "Reset token sent! Check your email.",
  };
};

export const resetPassword = async (
  values: NewPasswordValues,
  token: string,
) => {
  const validated = newPasswordSchema.safeParse(values);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Invalid input",
    };
  }

  const { password } = validated.data;

  const response = await authApi.post(URLS.auth.reset_password, {
    resetCode: token,
    newPassword: password,
  });

  if (!response.success) {
    return {
      success: false,
      error: response.error || "Failed to reset password",
    };
  }

  return {
    success: true,
    message: "Password reset successfully! You can now sign in.",
  };
};
