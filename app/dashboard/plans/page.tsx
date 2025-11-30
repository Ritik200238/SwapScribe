"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Copy, Edit, Trash2 } from "lucide-react";

const SAFE_STABLECOINS = [
  { value: "usdc-ethereum", label: "USDC (Ethereum)", coin: "usdc", network: "ethereum" },
  { value: "usdc-base", label: "USDC (Base)", coin: "usdc", network: "base" },
  { value: "usdc-arbitrum", label: "USDC (Arbitrum)", coin: "usdc", network: "arbitrum" },
  { value: "usdc-optimism", label: "USDC (Optimism)", coin: "usdc", network: "optimism" },
  { value: "usdt-ethereum", label: "USDT (Ethereum)", coin: "usdt", network: "ethereum" },
  { value: "usdt-tron", label: "USDT (Tron)", coin: "usdt", network: "tron" },
];

interface Plan {
  id: string;
  name: string;
  description: string | null;
  priceUsd: number;
  billingInterval: string;
  settleCoin: string;
  settleNetwork: string;
  publicSlug: string;
  isActive: boolean;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { toast } = useToast();

  // Create Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priceUsd: "",
    billingInterval: "monthly",
    settleCoin: "usdc",
    settleNetwork: "ethereum",
  });
  
  // Edit Form state
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    priceUsd: "",
    billingInterval: "monthly",
    settleCoin: "usdc",
    settleNetwork: "ethereum",
    isActive: true,
  });

  const [selectedPair, setSelectedPair] = useState("usdc-ethereum");
  const [editSelectedPair, setEditSelectedPair] = useState("usdc-ethereum");

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    try {
      const res = await fetch("/api/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (error) {
      console.error("Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  }

  const handlePairChange = (value: string, isEdit = false) => {
    const pair = SAFE_STABLECOINS.find(p => p.value === value);
    if (pair) {
      if (isEdit) {
        setEditSelectedPair(value);
        setEditFormData(prev => ({
          ...prev,
          settleCoin: pair.coin,
          settleNetwork: pair.network
        }));
      } else {
        setSelectedPair(value);
        setFormData(prev => ({
          ...prev,
          settleCoin: pair.coin,
          settleNetwork: pair.network
        }));
      }
    }
  };

  async function createPlan(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          priceUsd: parseFloat(formData.priceUsd),
        }),
      });

      if (res.ok) {
        toast({ title: "Success", description: "Plan created successfully" });
        setOpen(false);
        fetchPlans();
        setFormData({
          name: "",
          description: "",
          priceUsd: "",
          billingInterval: "monthly",
          settleCoin: "usdc",
          settleNetwork: "ethereum",
        });
        setSelectedPair("usdc-ethereum");
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to create plan" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong" });
    }
  }

  async function updatePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      const res = await fetch(`/api/plans/${editingPlan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editFormData,
          priceUsd: parseFloat(editFormData.priceUsd),
        }),
      });

      if (res.ok) {
        toast({ title: "Updated", description: "Plan updated successfully" });
        setEditOpen(false);
        fetchPlans();
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to update plan" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong" });
    }
  }

  async function deletePlan(id: string) {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/plans/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Deleted", description: "Plan deleted" });
        fetchPlans();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete" });
    }
  }

  const startEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setEditFormData({
      name: plan.name,
      description: plan.description || "",
      priceUsd: plan.priceUsd.toString(),
      billingInterval: plan.billingInterval,
      settleCoin: plan.settleCoin,
      settleNetwork: plan.settleNetwork,
      isActive: plan.isActive,
    });
    
    // Find matching pair for select
    const pair = SAFE_STABLECOINS.find(
      p => p.coin === plan.settleCoin && p.network === plan.settleNetwork
    );
    if (pair) {
      setEditSelectedPair(pair.value);
    }
    
    setEditOpen(true);
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/subscribe/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Copied", description: "Checkout link copied to clipboard" });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Plans</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Plan</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Subscription Plan</DialogTitle>
            </DialogHeader>
            <form onSubmit={createPlan} className="space-y-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                  placeholder="Pro Plan"
                />
              </div>
              <div className="space-y-2">
                <Label>Price (USD)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={formData.priceUsd} 
                  onChange={e => setFormData({...formData, priceUsd: e.target.value})} 
                  required 
                  placeholder="10.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Billing Interval</Label>
                <Select 
                  value={formData.billingInterval} 
                  onValueChange={v => setFormData({...formData, billingInterval: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payout Currency</Label>
                <Select value={selectedPair} onValueChange={(v) => handlePairChange(v, false)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SAFE_STABLECOINS.map((pair) => (
                      <SelectItem key={pair.value} value={pair.value}>
                        {pair.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  You’ll receive subscription revenue in this stablecoin.
                </p>
              </div>
              <Button type="submit" className="w-full">Create Plan</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Plan</DialogTitle>
            </DialogHeader>
            <form onSubmit={updatePlan} className="space-y-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input 
                  value={editFormData.name} 
                  onChange={e => setEditFormData({...editFormData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Price (USD)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={editFormData.priceUsd} 
                  onChange={e => setEditFormData({...editFormData, priceUsd: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Billing Interval</Label>
                <Select 
                  value={editFormData.billingInterval} 
                  onValueChange={v => setEditFormData({...editFormData, billingInterval: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={editFormData.isActive ? "active" : "inactive"} 
                  onValueChange={v => setEditFormData({...editFormData, isActive: v === "active"})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead>Payout</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">No plans found. Create one!</TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>${plan.priceUsd.toFixed(2)}</TableCell>
                  <TableCell className="capitalize">{plan.billingInterval}</TableCell>
                  <TableCell className="uppercase font-mono text-xs">
                    {plan.settleCoin}-{plan.settleNetwork}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => copyLink(plan.publicSlug)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/subscribe/${plan.publicSlug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(plan)}>
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deletePlan(plan.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}