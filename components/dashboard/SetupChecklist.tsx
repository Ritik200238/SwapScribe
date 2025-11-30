import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";

interface SetupChecklistProps {
  hasSettings: boolean;
  hasPlans: boolean;
}

export function SetupChecklist({ hasSettings, hasPlans }: SetupChecklistProps) {
  const steps = [
    {
      title: "Configure Payout Wallet",
      description: "Set where you want to receive your funds (USDC, ETH, etc.)",
      href: "/dashboard/settings",
      completed: hasSettings,
      actionText: "Go to Settings",
    },
    {
      title: "Create Subscription Plan",
      description: "Define your first product (e.g., 'Pro Plan - $10/mo')",
      href: "/dashboard/plans",
      completed: hasPlans,
      actionText: "Create Plan",
    },
    {
      title: "Share & Test",
      description: "Copy your public checkout link and simulate a payment.",
      href: hasPlans ? "/dashboard/plans" : "#",
      completed: false, // Always encourages sharing
      actionText: "View Plans",
    },
  ];

  const progress = steps.filter((s) => s.completed).length;
  const total = steps.length - 1; // Don't count the last "Share" step strictly for completion logic

  if (progress >= total) return null; // Hide if setup is mostly done

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🚀 Get Started with SwapScribe
        </CardTitle>
        <CardDescription>
          Complete these steps to start accepting crypto subscriptions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              step.completed ? "bg-muted/50 border-transparent" : "bg-background border-border"
            }`}
          >
            <div className="flex items-center gap-3">
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <div className={`font-medium ${step.completed && "line-through text-muted-foreground"}`}>
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground hidden sm:block">
                  {step.description}
                </div>
              </div>
            </div>
            {!step.completed && (
              <Button size="sm" variant="secondary" asChild>
                <Link href={step.href} className="flex items-center gap-1">
                  {step.actionText} <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
