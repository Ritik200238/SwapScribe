import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo merchant
  const hashedPassword = await bcrypt.hash("demo123", 10);

  const merchant = await prisma.merchant.upsert({
    where: { email: "demo@swapscribe.io" },
    update: {},
    create: {
      email: "demo@swapscribe.io",
      password: hashedPassword,
      name: "Demo Merchant",
    },
  });

  console.log("✅ Created demo merchant:", merchant.email);

  // Create merchant settings
  const settings = await prisma.merchantSettings.upsert({
    where: { merchantId: merchant.id },
    update: {},
    create: {
      merchantId: merchant.id,
      displayName: "SwapScribe Demo",
      settleAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", // Example address
      settleCoin: "usdc",
      settleNetwork: "ethereum",
      primaryColor: "#6366f1",
    },
  });

  console.log("✅ Created merchant settings");

  // Create demo plan
  const plan = await prisma.plan.upsert({
    where: { publicSlug: "premium-monthly" },
    update: {},
    create: {
      merchantId: merchant.id,
      name: "Premium Monthly",
      description: "Access to all premium features with monthly billing",
      priceUsd: 29.99,
      billingInterval: "monthly",
      settleCoin: "usdc",
      settleNetwork: "ethereum",
      publicSlug: "premium-monthly",
      isActive: true,
    },
  });

  console.log("✅ Created demo plan:", plan.name);

  // Create another plan
  const yearlyPlan = await prisma.plan.upsert({
    where: { publicSlug: "premium-yearly" },
    update: {},
    create: {
      merchantId: merchant.id,
      name: "Premium Yearly",
      description: "Save 20% with annual billing - all premium features",
      priceUsd: 287.90, // ~$24/month when paid yearly
      billingInterval: "yearly",
      settleCoin: "usdc",
      settleNetwork: "ethereum",
      publicSlug: "premium-yearly",
      isActive: true,
    },
  });

  console.log("✅ Created yearly plan:", yearlyPlan.name);

  console.log("\n🎉 Seeding complete!");
  console.log("\n📝 Demo credentials:");
  console.log("   Email: demo@swapscribe.io");
  console.log("   Password: demo123");
  console.log("\n🔗 Demo plan URL:");
  console.log(`   http://localhost:3000/subscribe/${plan.publicSlug}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
