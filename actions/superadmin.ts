"use server";

import { auth } from "@/auth";
import gigBusinessService from "@/lib/services/gig-business.service";
import { SUPER_ADMIN_ROLES } from "@/lib/const";

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Not authenticated");
  }
  if (!SUPER_ADMIN_ROLES.includes(session.user.userType)) {
    throw new Error("Unauthorized: Superadmin access required");
  }
  return session;
}

export async function getSuperAdminWalletSummary() {
  try {
    const session = await requireSuperAdmin();

    const lookupEmail = process.env.GIG_EMAIL || session.user.email || "";

    if (!lookupEmail) {
      return {
        success: false,
        balance: 0,
        message: "No email configured for company wallet lookup",
      };
    }

    const result = await gigBusinessService.getCompanyInfo(lookupEmail);
    const company = result.data?.[0];

    return {
      success: result.status === 200,
      balance: Number(company?.WalletAmount ?? 0),
      message: result.message || "Wallet summary retrieved",
    };
  } catch (error: any) {
    return {
      success: false,
      balance: 0,
      message: error.message || "Failed to retrieve wallet balance",
    };
  }
}

export async function getCompanyInfoByEmail(email: string) {
  try {
    await requireSuperAdmin();

    if (!email?.trim()) {
      return { success: false, message: "Email is required" };
    }

    const result = await gigBusinessService.getCompanyInfo(email.trim());

    if (result.status === 200 && result.data?.length > 0) {
      return {
        success: true,
        data: result.data,
        message: result.message || "Company details retrieved",
      };
    }

    return {
      success: false,
      message: result.message || "No company details found",
    };
  } catch (error: any) {
    console.error("[Superadmin] Company info error:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch company details",
    };
  }
}

export async function chargeMerchantWallet(input: {
  userId: string;
  amount: number;
  referenceNo: string;
  description: string;
}) {
  try {
    await requireSuperAdmin();

    if (!input.userId?.trim()) {
      return { success: false, message: "User ID is required" };
    }
    if (!input.referenceNo?.trim()) {
      return { success: false, message: "Reference number is required" };
    }
    if (!input.description?.trim()) {
      return { success: false, message: "Description is required" };
    }
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      return { success: false, message: "Amount must be greater than zero" };
    }

    const result = await gigBusinessService.chargeWallet({
      UserId: input.userId.trim(),
      Amount: input.amount,
      BillType: 0,
      ReferenceNo: input.referenceNo.trim(),
      Description: input.description.trim(),
    });

    return {
      success: result.status === 200,
      data: result.data,
      message: result.message || "Wallet charged",
    };
  } catch (error: any) {
    console.error("[Superadmin] Wallet charge error:", error);
    return {
      success: false,
      message: error.message || "Failed to charge wallet",
    };
  }
}

export async function generateWaybillInvoice(waybill: string) {
  try {
    await requireSuperAdmin();

    if (!waybill?.trim()) {
      return { success: false, message: "Waybill number is required" };
    }

    const result = await gigBusinessService.generateInvoice({
      Waybill: waybill.trim(),
    });

    return {
      success: result.status === 200,
      data: result.data,
      message: result.message || "Invoice generated",
    };
  } catch (error: any) {
    console.error("[Superadmin] Invoice generation error:", error);
    return {
      success: false,
      message: error.message || "Failed to generate invoice",
    };
  }
}
