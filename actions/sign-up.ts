"use server";

import { authApi } from "@/lib/api-client";
import { URLS } from "@/lib/const";
import { signUpFormSchema, SignUpFormValues } from "@/lib/schemas";

const USER_TYPE = "USER";

interface SignUpResponse {
  success: boolean;
  data?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  message?: string;
}

export const signup = async (values: SignUpFormValues) => {
  const validatedFields = signUpFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      error: validatedFields.error.issues[0]?.message || "Invalid fields",
    };
  }

  const { fullName, email, password, phone, dob, address } =
    validatedFields.data;

  // Split full name into first and last name
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const url = `${URLS.auth.sign_up}?userType=${encodeURIComponent(USER_TYPE)}`;

  const response = await authApi.post<SignUpResponse>(url, {
    firstName,
    lastName,
    email,
    password,
    confirmpassword: password,
    phone,
    dob,
    address,
  });

  if (!response.success) {
    return {
      success: false,
      error: response.error || "Failed to create account",
    };
  }

  return {
    success: true,
    message: "Account created successfully! Please sign in.",
    data: response.data,
  };
};
