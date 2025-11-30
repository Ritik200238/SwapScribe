"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Invoice {
  id: string;
  amountUsd: number;
  status: string;
  dueAt: string;
  subscription: {
    subscriber: { email: string };
    plan: { name: string };
  };
  depositCoin: string | null;
  depositNetwork: string | null;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await fetch("/api/invoices");
        if (res.ok) {
          const data = await res.json();
          setInvoices(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default'; // bg-primary (usually black/white)
      case 'pending_payment': return 'outline'; // yellow-ish handled by CSS usually or custom variant
      case 'failed': return 'destructive';
      case 'expired': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subscriber</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Paid With</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">No invoices found.</TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.subscription.subscriber.email}</TableCell>
                  <TableCell>${inv.amountUsd.toFixed(2)}</TableCell>
                  <TableCell>{inv.subscription.plan.name}</TableCell>
                  <TableCell className="uppercase">
                    {inv.depositCoin ? `${inv.depositCoin}` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(inv.status) as any}>
                      {inv.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell suppressHydrationWarning>
                    {new Date(inv.dueAt).toLocaleDateString()}
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