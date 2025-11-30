import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Login attempt for:", body.email);
    
    const validated = loginSchema.parse(body);

    // Find merchant
    const merchant = await prisma.merchant.findUnique({
      where: { email: validated.email },
    });

    if (!merchant) {
      console.log("Login failed: User not found");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(validated.password, merchant.password);
    if (!isValid) {
      console.log("Login failed: Invalid password");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create session
    const token = await createSession({
      merchantId: merchant.id,
      email: merchant.email,
    });

    await setSessionCookie(token);
    console.log("Login success. Cookie set for:", merchant.email);

    return NextResponse.json({
      merchant: {
        id: merchant.id,
        email: merchant.email,
        name: merchant.name,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to login" },
      { status: 400 }
    );
  }
}