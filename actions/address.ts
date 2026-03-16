"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const addressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;

export interface SavedAddress {
  id: string;
  userId: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Get all saved addresses for the current user
export async function getSavedAddresses(): Promise<{
  success: boolean;
  data?: SavedAddress[];
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const addresses = await db.savedAddress.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return { success: true, data: addresses };
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return { success: false, error: "Failed to fetch addresses" };
  }
}

// Get the default address for the current user
export async function getDefaultAddress(): Promise<{
  success: boolean;
  data?: SavedAddress | null;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const address = await db.savedAddress.findFirst({
      where: {
        userId: session.user.id,
        isDefault: true,
      },
    });

    // If no default, get the most recent address
    if (!address) {
      const recentAddress = await db.savedAddress.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      });
      return { success: true, data: recentAddress };
    }

    return { success: true, data: address };
  } catch (error) {
    console.error("Error fetching default address:", error);
    return { success: false, error: "Failed to fetch default address" };
  }
}

// Create a new saved address
export async function createSavedAddress(
  input: AddressInput
): Promise<{ success: boolean; data?: SavedAddress; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const validated = addressSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid input",
      };
    }

    const { isDefault, ...data } = validated.data;

    // If this is set as default, unset other defaults first
    if (isDefault) {
      await db.savedAddress.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // If this is the user's first address, make it default
    const existingCount = await db.savedAddress.count({
      where: { userId: session.user.id },
    });

    const address = await db.savedAddress.create({
      data: {
        ...data,
        userId: session.user.id,
        isDefault: isDefault || existingCount === 0,
      },
    });

    revalidatePath("/checkout");
    return { success: true, data: address };
  } catch (error) {
    console.error("Error creating address:", error);
    return { success: false, error: "Failed to create address" };
  }
}

// Update an existing saved address
export async function updateSavedAddress(
  id: string,
  input: Partial<AddressInput>
): Promise<{ success: boolean; data?: SavedAddress; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify ownership
    const existing = await db.savedAddress.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return { success: false, error: "Address not found" };
    }

    const { isDefault, ...data } = input;

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.savedAddress.updateMany({
        where: { userId: session.user.id, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await db.savedAddress.update({
      where: { id },
      data: {
        ...data,
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    revalidatePath("/checkout");
    return { success: true, data: address };
  } catch (error) {
    console.error("Error updating address:", error);
    return { success: false, error: "Failed to update address" };
  }
}

// Delete a saved address
export async function deleteSavedAddress(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify ownership
    const existing = await db.savedAddress.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return { success: false, error: "Address not found" };
    }

    await db.savedAddress.delete({ where: { id } });

    // If deleted address was default, make another one default
    if (existing.isDefault) {
      const nextAddress = await db.savedAddress.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      });

      if (nextAddress) {
        await db.savedAddress.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    revalidatePath("/checkout");
    return { success: true };
  } catch (error) {
    console.error("Error deleting address:", error);
    return { success: false, error: "Failed to delete address" };
  }
}

// Set an address as default
export async function setDefaultAddress(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Verify ownership
    const existing = await db.savedAddress.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return { success: false, error: "Address not found" };
    }

    // Unset all defaults
    await db.savedAddress.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });

    // Set new default
    await db.savedAddress.update({
      where: { id },
      data: { isDefault: true },
    });

    revalidatePath("/checkout");
    return { success: true };
  } catch (error) {
    console.error("Error setting default address:", error);
    return { success: false, error: "Failed to set default address" };
  }
}
