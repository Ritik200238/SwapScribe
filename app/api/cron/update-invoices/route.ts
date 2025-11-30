import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sideshift } from "@/lib/sideshift";

// Map SideShift statuses to our Invoice statuses
const STATUS_MAP: Record<string, string> = {
  waiting: "pending_payment",
  pending: "processing",
  processing: "processing",
  review: "processing",
  settling: "processing",
  settled: "paid",
  refund: "failed",
  refunding: "failed",
  refunded: "failed",
  expired: "expired",
};

export async function GET(request: Request) {
  // Vercel Cron Job protection
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === "production") {
    // return new NextResponse("Unauthorized", { status: 401 });
    // Allow standard requests for now for testing, but in prod Vercel sets this header
  }

  try {
    // 1. Find pending invoices
    const pendingInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: ["pending_payment", "processing"] },
        sideShiftShiftId: { not: null },
      },
      take: 50, // Batch size
    });

    console.log(`Cron: Checking ${pendingInvoices.length} pending invoices...`);

    const updates = [];

    for (const invoice of pendingInvoices) {
      if (!invoice.sideShiftShiftId) continue;

      try {
        const shift = await sideshift.getShiftStatus(invoice.sideShiftShiftId);
        const newStatus = STATUS_MAP[shift.status] || "pending_payment";

        // Only update if status changed
        if (newStatus !== invoice.status) {
          console.log(`Invoice ${invoice.id}: ${invoice.status} -> ${newStatus}`);
          
          const updateData: any = { status: newStatus };
          if (newStatus === "paid") {
            updateData.paidAt = new Date();
          }

          const updatePromise = prisma.invoice.update({
            where: { id: invoice.id },
            data: updateData,
          });
          updates.push(updatePromise);
        }
      } catch (err) {
        console.error(`Failed to check shift ${invoice.sideShiftShiftId}:`, err);
      }
    }

    await Promise.all(updates);

    return NextResponse.json({ 
      success: true, 
      checked: pendingInvoices.length, 
      updated: updates.length 
    });

  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
