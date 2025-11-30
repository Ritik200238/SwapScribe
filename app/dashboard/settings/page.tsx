"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const SAFE_STABLECOINS = [
  { value: "usdc-ethereum", label: "USDC (Ethereum)", coin: "usdc", network: "ethereum" },
  { value: "usdc-base", label: "USDC (Base)", coin: "usdc", network: "base" },
  { value: "usdc-arbitrum", label: "USDC (Arbitrum)", coin: "usdc", network: "arbitrum" },
  { value: "usdc-optimism", label: "USDC (Optimism)", coin: "usdc", network: "optimism" },
  { value: "usdt-ethereum", label: "USDT (Ethereum)", coin: "usdt", network: "ethereum" },
  { value: "usdt-tron", label: "USDT (Tron)", coin: "usdt", network: "tron" },
];

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    displayName: "",
    settleAddress: "",
    settleCoin: "usdc",
    settleNetwork: "ethereum",
    primaryColor: "#6366f1",
  });
  const [selectedPair, setSelectedPair] = useState("usdc-ethereum");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setFormData({
            displayName: data.displayName || "",
            settleAddress: data.settleAddress || "",
            settleCoin: data.settleCoin || "usdc",
            settleNetwork: data.settleNetwork || "ethereum",
            primaryColor: data.primaryColor || "#6366f1",
          });
          
          // Match existing setting to pair
          const pair = SAFE_STABLECOINS.find(
            p => p.coin === data.settleCoin && p.network === data.settleNetwork
          );
          if (pair) setSelectedPair(pair.value);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handlePairChange = (value: string) => {
    const pair = SAFE_STABLECOINS.find(p => p.value === value);
    if (pair) {
      setSelectedPair(value);
      setFormData(prev => ({
        ...prev,
        settleCoin: pair.coin,
        settleNetwork: pair.network
      }));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast({ title: "Saved", description: "Settings updated successfully" });
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to save settings" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Merchant Profile</CardTitle>
          <CardDescription>
            Configure how you appear to customers and where you get paid.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input 
                value={formData.displayName} 
                onChange={e => setFormData({...formData, displayName: e.target.value})}
                placeholder="Your Business Name"
              />
            </div>

            <div className="space-y-2">
              <Label>Payout Wallet Address</Label>
              <Input 
                value={formData.settleAddress} 
                onChange={e => setFormData({...formData, settleAddress: e.target.value})}
                placeholder="0x..."
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Funds collected from subscribers will be sent here after conversion.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Preferred Payout Currency</Label>
              <Select value={selectedPair} onValueChange={handlePairChange}>
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
                You’ll always receive your subscription revenue in this stablecoin.
              </p>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
