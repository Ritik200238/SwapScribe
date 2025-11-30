import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createPlanSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plans = await prisma.plan.findMany({
      where: { merchantId: session.merchantId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Get plans error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createPlanSchema.parse(body);

    // Generate unique slug
    const slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + "-" + Math.random().toString(36).substr(2, 6);

    const plan = await prisma.plan.create({
      data: {
        merchantId: session.merchantId,
        name: validated.name,
        description: validated.description,
        priceUsd: validated.priceUsd,
        billingInterval: validated.billingInterval,
        settleCoin: validated.settleCoin,
        settleNetwork: validated.settleNetwork,
        publicSlug: slug,
      },
    });

    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error("Create plan error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create plan" },
      { status: 400 }
    );
  }
}
