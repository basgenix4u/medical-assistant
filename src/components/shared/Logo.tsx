// src/components/shared/Logo.tsx

"use client";

import { Activity } from "lucide-react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizes = {
    sm: { icon: 18, text: "16px", padding: "8px", radius: "9px" },
    md: { icon: 20, text: "18px", padding: "10px", radius: "11px" },
    lg: { icon: 24, text: "22px", padding: "12px", radius: "13px" },
  };

  const config = sizes[size];

  return (
    <Link
      href="/"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        textDecoration: "none",
      }}
      className={className}
      aria-label="MedAssist home"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--gradient-brand)",
          borderRadius: config.radius,
          padding: config.padding,
          boxShadow:
            "inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 4px 12px -2px rgba(14, 122, 95, 0.4)",
        }}
        aria-hidden="true"
      >
        <Activity size={config.icon} color="white" strokeWidth={2.5} />
      </div>
      {showText && (
        <span
          style={{
            fontSize: config.text,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
          }}
        >
          MedAssist
        </span>
      )}
    </Link>
  );
}
