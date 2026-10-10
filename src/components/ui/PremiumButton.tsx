// src/components/ui/PremiumButton.tsx
import Link from "next/link";
import type { ReactNode } from "react";

interface PremiumButtonProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "light" | "outline";
  size?: "md" | "lg";
  className?: string;
}

/** Premium pill CTA — gradient primary, light-on-dark, or outline. */
export function PremiumButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: PremiumButtonProps) {
  const classes = [
    "btn-premium",
    `btn-premium-${variant}`,
    size === "lg" ? "btn-premium-lg" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
