"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
}

export function GlassCard({ children, className, gradient, ...props }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/5 bg-black/40 p-6 backdrop-blur-xl shadow-glass",
        gradient && "before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-primary/5 before:via-transparent before:to-transparent",
        className
      )}
      {...props}
    >
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("/noise.png")' }} />
      
      {children}
    </motion.div>
  );
}
