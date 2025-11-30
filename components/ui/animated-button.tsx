"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  className?: string;
}

export function AnimatedButton({ 
  children, 
  variant = "primary", 
  size = "md", 
  isLoading, 
  className,
  ...props 
}: AnimatedButtonProps) {
  
  const variants = {
    primary: "bg-primary text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.7)] hover:bg-primary/90 border border-transparent",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent",
    outline: "bg-transparent border border-white/10 text-foreground hover:bg-white/5 hover:border-white/20 backdrop-blur-sm",
    ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/5",
    danger: "bg-destructive text-white hover:bg-destructive/90 shadow-sm",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 overflow-hidden",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit/50 backdrop-blur-[1px]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      )}
      <span className={cn("flex items-center gap-2", isLoading && "opacity-0")}>
        {children}
      </span>
    </motion.button>
  );
}
