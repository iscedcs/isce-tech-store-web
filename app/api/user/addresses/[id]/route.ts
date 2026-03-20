import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const address = await db.savedAddress.findUnique({
      where: { id: params.id },
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    // Check if address belongs to the current user
    if (address.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(address);
  } catch (error) {
    console.error("Failed to fetch address:", error);
    return NextResponse.json(
      { error: "Failed to fetch address" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const address = await db.savedAddress.findUnique({
      where: { id: params.id },
    });

    if (!address || address.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If setting as default, remove default from other addresses
    if (body.isDefault) {
      await db.savedAddress.updateMany({
        where: { userId: session.user.id, id: { not: params.id } },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await db.savedAddress.update({
      where: { id: params.id },
      data: {
        label: body.label || address.label,
        firstName: body.firstName || address.firstName,
        lastName: body.lastName || address.lastName,
        phone: body.phone || address.phone,
        address: body.address || address.address,
        city: body.city || address.city,
        state: body.state || address.state,
        latitude:
          body.latitude !== undefined ? body.latitude : address.latitude,
        longitude:
          body.longitude !== undefined ? body.longitude : address.longitude,
        isDefault:
          body.isDefault !== undefined ? body.isDefault : address.isDefault,
      },
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error("Failed to update address:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const address = await db.savedAddress.findUnique({
      where: { id: params.id },
    });

    if (!address || address.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await db.savedAddress.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Address deleted" });
  } catch (error) {
    console.error("Failed to delete address:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const address = await db.savedAddress.findUnique({
      where: { id: params.id },
    });

    if (!address || address.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If setting as default, remove default from other addresses
    if (body.isDefault) {
      await db.savedAddress.updateMany({
        where: { userId: session.user.id, id: { not: params.id } },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await db.savedAddress.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error("Failed to update address:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 },
    );
  }
}
