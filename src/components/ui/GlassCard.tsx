// src/components/ui/GlassCard.tsx
import type { CSSProperties, ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** Enable hover lift + glow (default true). */
  hover?: boolean;
  style?: CSSProperties;
}

/** Premium glass surface primitive (subtle glassmorphism, hairline border). */
export function GlassCard({ children, className = "", hover = true, style }: GlassCardProps) {
  return (
    <div
      className={`glass-card${hover ? " glass-card-hover" : ""}${className ? ` ${className}` : ""}`}
      style={style}
    >
      {children}
    </div>
  );
}
