import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await db.savedAddress.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Failed to fetch addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // If setting as default, remove default from other addresses
    if (body.isDefault) {
      await db.savedAddress.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const address = await db.savedAddress.create({
      data: {
        userId: session.user.id,
        label: body.label,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        isDefault: body.isDefault || false,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error("Failed to create address:", error);
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 },
    );
  }
}
