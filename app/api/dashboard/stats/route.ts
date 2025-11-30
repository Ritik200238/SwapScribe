import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get active subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        plan: {
          merchantId: session.merchantId,
        },
        status: "active",
      },
    });

    // Get paid invoices
    const paidInvoices = await prisma.invoice.count({
      where: {
        subscription: {
          plan: {
            merchantId: session.merchantId,
          },
        },
        status: "paid",
      },
    });

    // Get pending invoices
    const pendingInvoices = await prisma.invoice.count({
      where: {
        subscription: {
          plan: {
            merchantId: session.merchantId,
          },
        },
        status: "pending_payment",
      },
    });

    // Calculate Total Revenue
    const revenueResult = await prisma.invoice.aggregate({
      where: {
        subscription: {
          plan: {
            merchantId: session.merchantId,
          },
        },
        status: "paid",
      },
      _sum: {
        amountUsd: true,
      },
    });
    const totalRevenue = revenueResult._sum.amountUsd || 0;

    // Calculate MRR (monthly recurring revenue)
    const subscriptions = await prisma.subscription.findMany({
      where: {
        plan: {
          merchantId: session.merchantId,
        },
        status: "active",
      },
      include: {
        plan: true,
      },
    });

    const mrr = subscriptions.reduce((total, sub) => {
      const price = sub.plan.priceUsd;
      const monthlyValue =
        sub.plan.billingInterval === "yearly" ? price / 12 : price;
      return total + monthlyValue;
    }, 0);

    return NextResponse.json({
      activeSubscriptions,
      paidInvoices,
      pendingInvoices,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      mrr: Math.round(mrr * 100) / 100,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
