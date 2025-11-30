import { prisma } from "@/lib/db";
import SubscriptionForm from "./SubscriptionForm";
import { notFound } from "next/navigation";
import { ShieldCheck, Lock } from "lucide-react";

export default async function SubscribePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const plan = await prisma.plan.findUnique({
    where: {
      publicSlug: slug,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      description: true,
      priceUsd: true,
      billingInterval: true,
      settleCoin: true,
      merchant: {
        select: {
          settings: {
            select: {
              displayName: true,
              logoUrl: true,
            },
          },
        },
      },
    },
  });

  if (!plan) {
    notFound();
  }

  return (
    <div className="min-h-screen w-full bg-background selection:bg-primary/30 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center mb-8 space-y-2 animate-fade-in-up">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/70 backdrop-blur-md">
          <Lock className="w-3 h-3" />
          Secure Checkout
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{plan.merchant.settings?.displayName}</h1>
      </div>

      {/* Main Card Area */}
      <div className="relative z-10 w-full max-w-lg px-4">
        <SubscriptionForm plan={plan} />
      </div>

      {/* Footer Trust Signals */}
      <div className="relative z-10 mt-12 flex flex-col items-center space-y-2 text-center animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="w-4 h-4" />
          <span>Powered by <span className="text-white font-medium">SwapScribe</span> & <span className="text-white font-medium">SideShift.ai</span></span>
        </div>
        <p className="text-xs text-white/20">Encrypted • Non-Custodial • Instant Settlement</p>
      </div>
    </div>
  );
}
