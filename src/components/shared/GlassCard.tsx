// src/components/shared/GlassCard.tsx

"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  variant?: "default" | "gradient" | "bordered" | "elevated";
  hover?: boolean;
  glow?: boolean;
  className?: string;
}

export function GlassCard({
  children,
  variant = "default",
  hover = true,
  glow = false,
  className,
  ...props
}: GlassCardProps) {
  const variants = {
    default: "glass-card",
    gradient: "glass-card bg-gradient-to-br from-white/90 to-white/50 dark:from-gray-900/90 dark:to-gray-800/50",
    bordered: "glass-card border-2 border-primary-500/20",
    elevated: "glass-card shadow-xl",
  };

  return (
    <motion.div
      className={cn(
        variants[variant],
        hover && "card-hover",
        glow && "glow",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}