"use client";

import { useState, useEffect } from "react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import { Loader2, CheckCircle2, Copy, AlertTriangle, RefreshCcw, ArrowRight, Mail, Wallet, Check } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { PaymentActivityLog } from "@/components/subscribe/PaymentActivityLog";
import { motion, AnimatePresence } from "framer-motion";
import { variants } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Common coins with SideShift icons
const POPULAR_COINS = [
  { id: "btc", name: "Bitcoin (BTC)", network: "bitcoin", icon: "https://sideshift.ai/coin-icons/btc.svg" },
  { id: "eth", name: "Ethereum (ETH)", network: "ethereum", icon: "https://sideshift.ai/coin-icons/eth.svg" },
  { id: "sol", name: "Solana (SOL)", network: "solana", icon: "https://sideshift.ai/coin-icons/sol.svg" },
  { id: "usdc", name: "USDC (Ethereum)", network: "ethereum", icon: "https://sideshift.ai/coin-icons/usdc.svg" },
  { id: "usdt", name: "USDT (Ethereum)", network: "ethereum", icon: "https://sideshift.ai/coin-icons/usdt.svg" },
  { id: "ltc", name: "Litecoin (LTC)", network: "litecoin", icon: "https://sideshift.ai/coin-icons/ltc.svg" },
  { id: "doge", name: "Dogecoin (DOGE)", network: "dogecoin", icon: "https://sideshift.ai/coin-icons/doge.svg" },
  { id: "xrp", name: "Ripple (XRP)", network: "ripple", icon: "https://sideshift.ai/coin-icons/xrp.svg" },
];

interface SubscriptionFormProps {
  plan: {
    id: string;
    name: string;
    priceUsd: number;
    billingInterval: string;
    settleCoin: string;
  };
}

function Stepper({ currentStep }: { currentStep: number }) {
  const steps = [
    { id: 0, label: "Details" },
    { id: 1, label: "Payment" },
    { id: 2, label: "Confirmed" },
  ];

  return (
    <div className="flex items-center justify-between w-full px-4 mb-8">
      {steps.map((step, idx) => {
        const isActive = idx === currentStep;
        const isCompleted = idx < currentStep;

        return (
          <div key={step.id} className="flex flex-col items-center relative flex-1">
            <div className="relative z-10 flex items-center justify-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isActive ? "rgba(99, 102, 241, 0.2)" : isCompleted ? "#10b981" : "rgba(255,255,255,0.05)",
                  borderColor: isActive ? "#6366f1" : isCompleted ? "#10b981" : "rgba(255,255,255,0.1)",
                  scale: isActive ? 1.1 : 1,
                }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                  isActive && "shadow-[0_0_15px_rgba(99,102,241,0.5)] text-primary font-bold",
                  isCompleted && "text-white border-transparent",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : <span>{step.id + 1}</span>}
              </motion.div>
            </div>
            
            <span className={cn(
              "text-[10px] font-medium mt-2 uppercase tracking-wider transition-colors duration-300",
              isActive ? "text-primary" : isCompleted ? "text-emerald-500" : "text-muted-foreground/50"
            )}>
              {step.label}
            </span>

            {/* Connector Line */}
            {idx !== steps.length - 1 && (
              <div className="absolute top-4 left-[50%] w-full h-[2px] bg-white/5 -z-0">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: isCompleted ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="h-full bg-emerald-500"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SubscriptionForm({ plan }: SubscriptionFormProps) {
  const { width, height } = useWindowSize();
  const [step, setStep] = useState<"details" | "payment" | "success">("details");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [depositCoin, setDepositCoin] = useState("btc");
  const [qrCode, setQrCode] = useState("");
  
  // Invoice/Shift State
  const [invoice, setInvoice] = useState<any>(null);
  const [shift, setShift] = useState<any>(null);
  const [status, setStatus] = useState<string>("");
  const [warning, setWarning] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  
  // Refund State
  const [showRefund, setShowRefund] = useState(false);
  const [refundAddress, setRefundAddress] = useState("");
  const [refundSubmitted, setRefundSubmitted] = useState(false);

  const { toast } = useToast();

  // Poll Status
  useEffect(() => {
    if (step === "payment" && invoice?.id) {
      setLastUpdated(new Date().toLocaleTimeString());

      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/invoices/${invoice.id}/status`);
          setLastUpdated(new Date().toLocaleTimeString());
          
          if (res.ok) {
            const data = await res.json();
            setStatus(data.invoice?.status || data.sideShiftStatus || ""); 
            
            if (data.warning) setWarning(data.warning);

            if (data.invoice?.status === "paid") {
              clearInterval(interval);
              setStep("success");
            }
            
            if (data.sideShiftStatus === "refund" && !refundSubmitted) {
               setShowRefund(true);
            }
          }
        } catch (error) {
          console.error("Polling failed", error);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [step, invoice, refundSubmitted]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const selectedCoin = POPULAR_COINS.find(c => c.id === depositCoin);

    try {
      const res = await fetch("/api/subscribe/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          email,
          depositCoin: selectedCoin?.id,
          depositNetwork: selectedCoin?.network, 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setInvoice(data.invoice);
        setShift(data.shift);
        
        const qr = await QRCode.toDataURL(data.shift.depositAddress);
        setQrCode(qr);
        
        setStep("payment");
        setStatus(data.invoice.status);
      } else {
        const err = await res.json();
        toast({ variant: "destructive", title: "Error", description: err.error || "Failed to create subscription" });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  async function handleRefundSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!refundAddress) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: refundAddress }),
      });
      
      if (res.ok) {
        setRefundSubmitted(true);
        setShowRefund(false);
        toast({ title: "Refund Address Set", description: "SideShift will process your refund shortly." });
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to set refund address." });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const currentStepIndex = step === "details" ? 0 : step === "payment" ? 1 : 2;

  return (
    <>
      {step === "success" && <Confetti width={width} height={height} recycle={false} numberOfPieces={800} gravity={0.2} />}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-glass p-8 relative overflow-hidden"
      >
        {/* Card Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
        
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2 drop-shadow-sm">{plan.name}</h2>
          <p className="text-lg font-medium text-primary/90 bg-primary/10 inline-block px-4 py-1 rounded-full border border-primary/20">
            ${plan.priceUsd.toFixed(2)} <span className="text-muted-foreground text-sm font-normal">/ {plan.billingInterval}</span>
          </p>
        </div>

        <Stepper currentStep={currentStepIndex} />

        <AnimatePresence mode="wait">
          {step === "details" && (
            <motion.form 
              key="details"
              variants={variants.scale}
              initial="hidden"
              animate="show"
              exit="hidden"
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground ml-1">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="email" 
                      required 
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="h-12 pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground ml-1">Select Asset</Label>
                  <div className="relative">
                    <Wallet className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground z-10" />
                    <Select value={depositCoin} onValueChange={setDepositCoin}>
                      <SelectTrigger className="h-12 pl-10 bg-white/5 border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors focus:ring-primary/20 focus:border-primary/50">
                        <SelectValue placeholder="Select cryptocurrency" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl rounded-xl shadow-2xl">
                        {POPULAR_COINS.map((coin) => (
                          <SelectItem key={coin.id} value={coin.id} className="focus:bg-primary/20 focus:text-white text-white/80 py-3 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <img src={coin.icon} alt={coin.id} className="w-6 h-6 rounded-full" />
                              <div className="flex flex-col items-start leading-none">
                                <span className="font-medium">{coin.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">{coin.network}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <AnimatedButton 
                type="submit" 
                className="w-full h-14 text-lg font-bold rounded-xl mt-6 shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)]" 
                isLoading={loading}
              >
                Continue to Payment <ArrowRight className="ml-2 h-5 w-5" />
              </AnimatedButton>
            </motion.form>
          )}

          {step === "payment" && shift && (
            <motion.div 
              key="payment"
              variants={variants.scale}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="space-y-6"
            >
              {showRefund ? (
                <div className="bg-destructive/10 p-6 rounded-2xl border border-destructive/30 space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-2 text-destructive font-semibold text-lg">
                    <AlertTriangle className="h-6 w-6" />
                    Refund Required
                  </div>
                  <p className="text-sm text-destructive-foreground/80">
                    Your payment requires a refund. Please provide a {shift?.depositCoin?.toUpperCase() || "Crypto"} address.
                  </p>
                  {refundSubmitted ? (
                    <div className="p-4 bg-black/20 rounded-xl text-center text-green-400 font-medium border border-green-500/20">
                      Refund address saved. SideShift will process it shortly.
                    </div>
                  ) : (
                    <form onSubmit={handleRefundSubmit} className="space-y-3">
                      <Input 
                        placeholder={`Your ${shift?.depositCoin?.toUpperCase() || "Crypto"} Address`} 
                        value={refundAddress} 
                        onChange={e => setRefundAddress(e.target.value)}
                        className="bg-black/20 border-destructive/30 text-white"
                      />
                      <AnimatedButton type="submit" variant="danger" className="w-full" isLoading={loading}>
                        Request Refund
                      </AnimatedButton>
                    </form>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center justify-center relative">
                    <div className="bg-white p-4 rounded-2xl border-4 border-white/10 shadow-2xl relative z-10">
                      {qrCode && <img src={qrCode} alt="Deposit QR Code" className="w-48 h-48 mix-blend-multiply" />}
                    </div>
                    {/* Glow behind QR */}
                    <div className="absolute inset-0 bg-primary/30 blur-3xl -z-0 opacity-50" />
                    
                    {lastUpdated && (
                      <div className="flex items-center gap-2 mt-6 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                        <p className="text-[10px] font-mono text-white/60 uppercase tracking-widest">
                          Live • {lastUpdated}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 text-center">
                    <p className="text-sm font-medium text-white/60 uppercase tracking-wide">Send <span className="text-white font-bold">{shift?.depositCoin?.toUpperCase() || "Crypto"}</span> to:</p>
                    <div className="flex items-center justify-center gap-2 p-4 bg-black/30 rounded-xl font-mono text-sm break-all border border-white/10 group hover:border-primary/50 transition-all duration-300 cursor-pointer shadow-inner" onClick={() => {
                      navigator.clipboard.writeText(shift.depositAddress);
                      toast({ title: "Address Copied" });
                    }}>
                      <span className="text-white/90">{shift.depositAddress}</span>
                      <Copy className="h-4 w-4 text-white/40 group-hover:text-primary transition-colors" />
                    </div>
                  </div>

                  <PaymentActivityLog status={status} />

                  {warning && (
                     <div className="flex items-center justify-center gap-2 text-orange-400 bg-orange-500/10 p-3 rounded-xl text-xs border border-orange-500/20">
                       <AlertTriangle className="h-4 w-4" />
                       <span>{warning}</span>
                     </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {step === "success" && (
            <motion.div 
              key="success"
              variants={variants.scale}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="flex flex-col items-center justify-center py-8 space-y-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 blur-[60px] opacity-30 rounded-full animate-pulse"></div>
                <div className="relative rounded-full bg-gradient-to-b from-green-400 to-green-600 p-1 shadow-[0_0_50px_-10px_rgba(34,197,94,0.5)]">
                  <div className="bg-black rounded-full p-8 border-4 border-green-500/20">
                    <CheckCircle2 className="h-20 w-20 text-green-500" />
                  </div>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-4xl font-bold text-white tracking-tight">Payment Successful!</h3>
                <p className="text-white/60 text-lg">Your subscription is now active.</p>
              </div>

              <div className="w-full bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4 backdrop-blur-md shadow-lg">
                <div className="flex justify-between text-sm border-b border-white/5 pb-3">
                  <span className="text-white/60">Plan</span>
                  <span className="font-medium text-white">{plan.name}</span>
                </div>
                <div className="flex justify-between text-sm border-b border-white/5 pb-3">
                  <span className="text-white/60">Amount</span>
                  <span className="font-medium text-white">${plan.priceUsd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Confirmation</span>
                  <span className="font-medium text-white font-mono">Sent to email</span>
                </div>
              </div>

              <AnimatedButton onClick={() => window.location.reload()} variant="outline" className="w-full h-12 text-base border-white/10 hover:bg-white/5">
                Make Another Payment
              </AnimatedButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
