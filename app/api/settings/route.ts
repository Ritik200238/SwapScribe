import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateSettingsSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.merchantSettings.findUnique({
      where: { merchantId: session.merchantId },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = updateSettingsSchema.parse(body);

    const settings = await prisma.merchantSettings.upsert({
      where: { merchantId: session.merchantId },
      update: validated,
      create: {
        merchantId: session.merchantId,
        ...validated,
      },
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 400 }
    );
  }
}
