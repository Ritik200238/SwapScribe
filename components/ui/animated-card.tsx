import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedCard({ children, className, delay = 0 }: AnimatedCardProps) {
  return (
    <div 
      className={cn(
        "animate-fade-in-up bg-card/50 backdrop-blur-sm border-white/5 hover:border-primary/30 hover:shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)] transition-all duration-500",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
