import { NextResponse } from "next/server";
import { sideshift } from "@/lib/sideshift";

export async function GET() {
  try {
    const coins = await sideshift.getCoins();
    return NextResponse.json(coins);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch coins" }, { status: 500 });
  }
}
