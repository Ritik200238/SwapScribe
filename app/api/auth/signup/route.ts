import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession, setSessionCookie } from "@/lib/auth";
import { signupSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = signupSchema.parse(body);

    // Check if email exists
    const exists = await prisma.merchant.findUnique({
      where: { email: validated.email },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create merchant
    const merchant = await prisma.merchant.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
      },
    });

    // Create default settings
    await prisma.merchantSettings.create({
      data: {
        merchantId: merchant.id,
        displayName: validated.name || "My Business",
        settleAddress: "", // User must set this
        settleCoin: "usdc",
        settleNetwork: "ethereum",
        primaryColor: "#6366f1",
      },
    });

    // Create session
    const token = await createSession({
      merchantId: merchant.id,
      email: merchant.email,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      merchant: {
        id: merchant.id,
        email: merchant.email,
        name: merchant.name,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to signup" },
      { status: 400 }
    );
  }
}
