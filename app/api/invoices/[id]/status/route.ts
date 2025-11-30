import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sideshift } from "@/lib/sideshift";
import { calculateNextDueDate } from "@/lib/utils";

// Allow 2% slippage for price fluctuations during variable shifts
const SLIPPAGE_TOLERANCE = 0.02;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // If already in terminal state, return as-is
    if (["paid", "expired", "failed"].includes(invoice.status)) {
      return NextResponse.json({ invoice });
    }

    // Poll SideShift for status
    if (invoice.sideShiftShiftId) {
      try {
        const shift = await sideshift.getShiftStatus(invoice.sideShiftShiftId);

        if (shift.status === "settled") {
          const settleAmount = parseFloat(shift.settleAmount || "0");
          const expectedAmount = invoice.amountUsd;
          
          // Check if payment meets expected amount (within tolerance)
          // Assuming settleCoin is a stablecoin (USDC/USDT) roughly pegged 1:1
          const minRequired = expectedAmount * (1 - SLIPPAGE_TOLERANCE);

          if (settleAmount >= minRequired) {
            // Full Payment
            const updatedInvoice = await prisma.invoice.update({
              where: { id },
              data: {
                status: "paid",
                paidAt: new Date(),
              },
            });

            // Update subscription
            const nextPeriodEnd = calculateNextDueDate(
              invoice.subscription.plan.billingInterval as "monthly" | "yearly"
            );

            await prisma.subscription.update({
              where: { id: invoice.subscription.id },
              data: {
                status: "active",
                currentPeriodEnd: nextPeriodEnd,
              },
            });

            return NextResponse.json({ invoice: updatedInvoice });
          } else {
            // Partial Payment (Underpaid)
            // We don't mark as paid, but we could log it or update status to 'partial' if schema supported it
            // For now, we keep it pending but log the issue. Real-world would require a top-up flow.
            console.warn(`Underpayment detected for invoice ${id}: Expected ${expectedAmount}, got ${settleAmount}`);
            
            // Optional: You could add a status 'partial_payment' to your schema if you want to show it in UI
            return NextResponse.json({ 
              invoice, 
              warning: "Payment detected but insufficient amount. Please contact support." 
            });
          }
        } else if (["expired", "refunded", "refunding"].includes(shift.status)) {
          // Terminal failure states
          const updatedInvoice = await prisma.invoice.update({
            where: { id },
            data: {
              status: shift.status === "expired" ? "expired" : "failed",
            },
          });
          return NextResponse.json({ invoice: updatedInvoice });
        } else if (shift.status === "refund") {
           // Refund required action state (waiting for address)
           // We pass this status to the frontend so it can show the refund input
           return NextResponse.json({ 
             invoice, 
             sideShiftStatus: "refund" 
           });
        }
      } catch (error) {
        console.error("Failed to poll shift status:", error);
      }
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Get invoice status error:", error);
    return NextResponse.json(
      { error: "Failed to get invoice status" },
      { status: 500 }
    );
  }
}