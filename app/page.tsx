import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, ShieldCheck, Zap, Coins, Repeat, Terminal } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedButton } from "@/components/ui/animated-button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary/30">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-neon">
              <Image 
                src="/logo.png" 
                alt="SwapScribe Logo" 
                fill
                className="object-cover"
              />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">SwapScribe</span>
          </div>
          <nav className="flex gap-4 items-center">
            <Link href="/login">
              <AnimatedButton variant="ghost" size="sm">Login</AnimatedButton>
            </Link>
            <Link href="/signup">
              <AnimatedButton size="sm" className="bg-primary shadow-neon">Get Started</AnimatedButton>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 lg:py-40 px-4 md:px-6 text-center overflow-hidden">
          {/* Dynamic Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-hero-glow blur-[120px] rounded-full pointer-events-none -z-10 opacity-20 animate-pulse-glow" />
          
          <div className="container mx-auto max-w-5xl space-y-8 relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary animate-fade-in-up backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              Powered by SideShift.ai V2
            </div>
            
            <h1 className="text-6xl font-extrabold tracking-tight lg:text-8xl animate-fade-in-up [text-wrap:balance]" style={{ animationDelay: '100ms' }}>
              <span className="block text-white drop-shadow-2xl mb-2">Crypto Subscriptions,</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-pink-400">
                Simplified.
              </span>
            </h1>
            
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Accept recurring payments in <span className="text-white font-medium">BTC, ETH, SOL</span>. 
              Get settled instantly in <span className="text-white font-medium">USDC</span>. 
              <br className="hidden md:block" />
              Zero volatility. Zero wallet friction. Just revenue.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-fade-in-up w-full max-w-md sm:max-w-none" style={{ animationDelay: '300ms' }}>
              <Link href="/signup">
                <AnimatedButton size="lg" className="w-full sm:w-auto h-14 text-lg rounded-full bg-white text-black hover:bg-white/90 shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] font-bold">
                  Start Accepting Crypto <ArrowRight className="ml-2 h-5 w-5" />
                </AnimatedButton>
              </Link>
              <Link href="#how-it-works">
                <AnimatedButton variant="outline" size="lg" className="w-full sm:w-auto h-14 text-lg rounded-full border-white/10 bg-white/5 backdrop-blur-md">
                  How it Works
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </section>

        {/* Value Props Grid */}
        <section id="features" className="py-24 bg-black/20 px-4 md:px-6 relative">
          <div className="container mx-auto relative z-10">
            <div className="grid gap-8 md:grid-cols-3">
              <GlassCard className="hover:bg-white/5 transition-colors duration-500 group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">Universal Acceptance</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Don't lose customers because they hold the "wrong" coin. Accept Bitcoin, Solana, Monero—anything SideShift supports.
                </p>
              </GlassCard>

              <GlassCard className="hover:bg-white/5 transition-colors duration-500 group" style={{ transitionDelay: "100ms" }}>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/10 text-green-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">Stable Settlement</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Market crashes shouldn't kill your MRR. We auto-swap everything to USDC/USDT before it hits your wallet.
                </p>
              </GlassCard>

              <GlassCard className="hover:bg-white/5 transition-colors duration-500 group" style={{ transitionDelay: "200ms" }}>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">Zero-Code Setup</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Create a plan, copy the link, and paste it in your Discord or newsletter. No API keys or smart contracts needed.
                </p>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-32 px-4 md:px-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none -z-10" />
          
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-4xl md:text-6xl font-bold text-center mb-24 text-white tracking-tight">
              From "Nice to meet you" to <span className="text-primary">"Payment Received"</span>
            </h2>

            <div className="grid gap-12 md:grid-cols-3 relative">
              {/* Connector Line */}
              <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />

              {[
                { icon: Terminal, title: "1. Create Plan", desc: "Define your pricing (e.g. $10/mo) and payout preference." },
                { icon: Repeat, title: "2. Share Link", desc: "Send the secure checkout link to your subscribers." },
                { icon: Coins, title: "3. Get Paid", desc: "They pay in BTC. You receive USDC. Instantly." }
              ].map((step, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center space-y-6 group">
                  <div className="w-32 h-32 rounded-3xl bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl group-hover:border-primary/50 group-hover:shadow-neon transition-all duration-500">
                    <step.icon className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-3">{step.title}</h4>
                    <p className="text-muted-foreground px-4">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 bg-black/40 backdrop-blur-sm">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
            <Image src="/logo.png" alt="Logo" width={24} height={24} className="rounded-sm" />
            <span className="text-sm font-semibold text-muted-foreground">SwapScribe &copy; 2025</span>
          </div>
          
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="https://sideshift.ai" target="_blank" className="hover:text-white transition-colors flex items-center gap-1">
              SideShift.ai <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}