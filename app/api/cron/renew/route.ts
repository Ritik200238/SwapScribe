import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Vercel Cron Secret Verification
// Ensure CRON_SECRET is set in your Vercel Project Settings
function verifyCronSecret(request: Request) {
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: Request) {
  // Optional: Enable verification if you set CRON_SECRET
  // if (!verifyCronSecret(request)) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    const now = new Date();
    
    // Find subscriptions due for renewal
    const dueSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "active",
        currentPeriodEnd: {
          lt: now,
        },
      },
      include: {
        plan: true,
      },
    });

    const results = [];

    for (const sub of dueSubscriptions) {
      // Mark as past_due
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "past_due" },
      });

      // Create new draft invoice
      const invoice = await prisma.invoice.create({
        data: {
          subscriptionId: sub.id,
          amountUsd: sub.plan.priceUsd,
          settleCoin: sub.plan.settleCoin,
          settleNetwork: sub.plan.settleNetwork,
          status: "draft",
          dueAt: now,
        },
      });

      // In a real app, trigger email here (e.g. via Resend)
      // await sendInvoiceEmail(sub.subscriber.email, invoice.id);

      results.push({
        subscriptionId: sub.id,
        invoiceId: invoice.id,
        status: "renewed_draft",
      });
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      details: results,
    });
  } catch (error: any) {
    console.error("Renewal Cron Error:", error);
    return NextResponse.json(
      { error: error.message || "Renewal job failed" },
      { status: 500 }
    );
  }
}
