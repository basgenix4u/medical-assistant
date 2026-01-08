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
    sm: { icon: 18, text: "16px", padding: "8px" },
    md: { icon: 20, text: "18px", padding: "10px" },
    lg: { icon: 24, text: "22px", padding: "12px" },
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
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--primary)",
          borderRadius: "12px",
          padding: config.padding,
        }}
      >
        <Activity size={config.icon} color="white" strokeWidth={2.5} />
      </div>
      {showText && (
        <span
          style={{
            fontSize: config.text,
            fontWeight: 700,
            color: "var(--primary)",
          }}
        >
          MedAssist
        </span>
      )}
    </Link>
  );
}