import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[\W_]/, "Password must contain at least one special character");

export const loginFormSchema = z.object({
  email: z.string().email({
    message: "Email address is not valid.",
  }),
  password: z.string().min(2, { message: "Please enter a valid password" }),
});

export const signUpFormSchema = z
  .object({
    fullName: z
      .string({
        required_error: "Full name is required",
      })
      .min(2, {
        message: "Full name must be at least 2 characters.",
      }),
    email: z.string().email({
      message: "Email address is not valid.",
    }),
    phone: z
      .string({
        required_error: "Phone number is required",
      })
      .min(10, {
        message: "Phone must be at least 10 characters.",
      }),
    dob: z
      .string({
        required_error: "Date of birth is required",
      })
      .min(1, {
        message: "Date of birth is required",
      }),
    address: z
      .string({
        required_error: "Address is required",
      })
      .min(5, {
        message: "Address must be at least 5 characters.",
      }),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  email: z.string().email({
    message: "Email address is not valid.",
  }),
});

export const newPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type NewPasswordValues = z.infer<typeof newPasswordSchema>;

// Checkout form schema
export const checkoutFormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^\+?[\d\s-]{10,}$/, "Invalid phone number"),
    address: z.string().optional().default(""),
    city: z.string().optional().default(""),
    state: z.string().optional().default(""),
    deliveryMethod: z.enum(["pickup", "home-delivery"]),
    pickupLocation: z.string().optional(),
    // GIG Logistics fields
    stationId: z.number().optional(),
    areaId: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    paymentMethod: z.enum(["paystack"]),
  })
  .refine(
    (data) => {
      if (data.deliveryMethod === "pickup" && !data.stationId) {
        return false;
      }
      return true;
    },
    {
      message: "Station selection is required for store pickup",
      path: ["stationId"],
    },
  )
  .refine(
    (data) => {
      if (data.deliveryMethod === "pickup" && !data.pickupLocation) {
        return false;
      }
      return true;
    },
    {
      message: "Pickup location is required for store pickup",
      path: ["pickupLocation"],
    },
  )
  .refine(
    (data) => {
      if (
        data.deliveryMethod === "home-delivery" &&
        (!data.address || !data.latitude || !data.longitude)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Please search and select a delivery address",
      path: ["address"],
    },
  );

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
