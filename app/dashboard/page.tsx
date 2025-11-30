"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { DollarSign, Users, FileText, Activity } from "lucide-react";
import { SetupChecklist } from "@/components/dashboard/SetupChecklist";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import { motion } from "framer-motion";
import { variants } from "@/lib/motion";

interface Stats {
  mrr: number;
  activeSubscribers: number;
  pendingInvoices: number;
  paidInvoices: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [hasSettings, setHasSettings] = useState(false);
  const [hasPlans, setHasPlans] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, settingsRes, plansRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/settings"),
          fetch("/api/plans")
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setHasSettings(!!data.settleAddress);
        }
        if (plansRes.ok) {
          const data = await plansRes.json();
          setHasPlans(Array.isArray(data) && data.length > 0);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4">
          <SkeletonLoader className="h-8 w-48" />
          <SkeletonLoader className="h-32 w-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonLoader key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const displayStats = stats || { mrr: 0, activeSubscribers: 0, pendingInvoices: 0, paidInvoices: 0, totalRevenue: 0 };

  return (
    <motion.div 
      variants={variants.container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <div className="flex flex-col gap-4">
        <motion.h2 variants={variants.item} className="text-3xl font-bold tracking-tight text-white">
          Dashboard Overview
        </motion.h2>
        
        <motion.div variants={variants.item}>
          <SetupChecklist hasSettings={hasSettings} hasPlans={hasPlans} />
        </motion.div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <GlassCard gradient className="hover:scale-[1.02] transition-transform duration-300 cursor-default">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white">${displayStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime collected</p>
          </div>
        </GlassCard>

        <GlassCard gradient className="hover:scale-[1.02] transition-transform duration-300 cursor-default">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-muted-foreground">Active Subscribers</div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white">{displayStats.activeSubscribers}</div>
            <p className="text-xs text-muted-foreground mt-1">Current active plans</p>
          </div>
        </GlassCard>

        <GlassCard gradient className="hover:scale-[1.02] transition-transform duration-300 cursor-default">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-muted-foreground">Monthly Recurring</div>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white">${displayStats.mrr.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Estimated MRR</p>
          </div>
        </GlassCard>

        <GlassCard gradient className="hover:scale-[1.02] transition-transform duration-300 cursor-default">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium text-muted-foreground">Pending Invoices</div>
            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-white">{displayStats.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">Processing now</p>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
