import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sideshift } from "@/lib/sideshift";
import { getUserIp } from "@/lib/ip";
import { createSubscriptionSchema } from "@/lib/validators";
import { calculateNextDueDate } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    // 1. Robust IP Extraction (Critical for SideShift)
    const userIp = await getUserIp();
    console.log("subscribe/start userIp >>>", userIp);
    
    if (!userIp) {
        console.error("Critical: Failed to determine user IP");
        return NextResponse.json({ error: "Unable to verify network identity." }, { status: 400 });
    }

    // --- 2. Rate Limiting ---
    const rateLimitWindow = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    const recentRequests = await prisma.rateLimit.count({
      where: {
        ip: userIp,
        action: "create_invoice",
        createdAt: { gte: rateLimitWindow },
      },
    });

    if (recentRequests >= 10) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // Log the request
    await prisma.rateLimit.create({
      data: { ip: userIp, action: "create_invoice" },
    });

    // --- 3. Input Validation ---
    const body = await request.json();
    const validated = createSubscriptionSchema.parse(body);

    // --- 4. Business Logic ---
    
    // Get plan
    const plan = await prisma.plan.findFirst({
      where: {
        id: validated.planId,
        isActive: true,
      },
      include: {
        merchant: {
          include: {
            settings: true,
          },
        },
      },
    });

    if (!plan || !plan.merchant.settings) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (!plan.merchant.settings.settleAddress) {
      return NextResponse.json(
        { error: "Merchant has not configured payout address" },
        { status: 400 }
      );
    }

    // Check permissions
    try {
      const permissions = await sideshift.checkPermissions(userIp);
      if (!permissions.createShift) {
        return NextResponse.json(
          { error: "Access denied. SideShift.ai is not available in your region." },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error("Permissions check failed:", error);
      // Continue anyway - permissions check might fail for other reasons (e.g. SideShift downtime)
    }

    // Find or create subscriber
    let subscriber = await prisma.subscriber.findFirst({
      where: {
        email: validated.email,
        merchantId: plan.merchantId,
      },
    });

    if (!subscriber) {
      subscriber = await prisma.subscriber.create({
        data: {
          email: validated.email,
          merchantId: plan.merchantId,
        },
      });
    }

    // Find or create subscription
    let subscription = await prisma.subscription.findFirst({
      where: {
        subscriberId: subscriber.id,
        planId: plan.id,
      },
    });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          subscriberId: subscriber.id,
          planId: plan.id,
          status: "past_due",
        },
      });
    }

    // Create invoice
    const dueAt = new Date();
    const invoice = await prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        amountUsd: plan.priceUsd,
        settleCoin: plan.settleCoin,
        settleNetwork: plan.settleNetwork,
        depositCoin: validated.depositCoin,
        depositNetwork: validated.depositNetwork,
        status: "draft",
        dueAt,
      },
    });

    // Create SideShift variable shift
    try {
      const shift = await sideshift.createVariableShift({
        settleAddress: plan.merchant.settings.settleAddress,
        depositCoin: validated.depositCoin,
        settleCoin: plan.settleCoin,
        depositNetwork: validated.depositNetwork,
        settleNetwork: plan.settleNetwork,
        refundAddress: validated.refundAddress,
        userIp: userIp, // Explicitly passing userIp
      });

      // Update invoice with shift details
      const updatedInvoice = await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          sideShiftShiftId: shift.id,
          depositAddress: shift.depositAddress,
          depositMemo: shift.depositMemo,
          depositMin: shift.depositMin,
          depositMax: shift.depositMax,
          expiresAt: new Date(shift.expiresAt),
          status: "pending_payment",
        },
      });

      return NextResponse.json({
        invoice: updatedInvoice,
        shift: {
          id: shift.id,
          depositAddress: shift.depositAddress,
          depositMemo: shift.depositMemo,
          depositMin: shift.depositMin,
          depositMax: shift.depositMax,
          expiresAt: shift.expiresAt,
        },
      });
    } catch (error: any) {
      console.error("SideShift shift creation failed:", error);

      // Mark invoice as failed
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "failed" },
      });

      // Return structured error
      const errorMessage = error instanceof Error ? error.message : "Failed to create payment shift";
      
      // Map specific SideShift error codes to HTTP status
      let status = 500;
      if (errorMessage.includes("Rate Limit")) status = 429;
      if (errorMessage.includes("Access Denied")) status = 403;
      if (errorMessage.includes("Bad Request")) status = 400;

      return NextResponse.json(
        { error: errorMessage },
        { status }
      );
    }
  } catch (error: any) {
    console.error("Subscribe start error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to start subscription",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
