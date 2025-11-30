import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sideshift } from "@/lib/sideshift";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json({ error: "Refund address is required" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice || !invoice.sideShiftShiftId) {
      return NextResponse.json({ error: "Invoice or Shift not found" }, { status: 404 });
    }

    await sideshift.setRefundAddress(invoice.sideShiftShiftId, address);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Set refund address error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to set refund address" },
      { status: 500 }
    );
  }
}
