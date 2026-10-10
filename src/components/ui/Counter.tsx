// src/components/ui/Counter.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface CounterProps {
  /** Final numeric value. */
  to: number;
  /** Decimals to render (e.g. 1 for 4.8). */
  decimals?: number;
  /** Suffix appended after the number (e.g. "+", "%"). */
  suffix?: string;
  /** Duration of the count-up animation in ms. */
  duration?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * Animated count-up number. Triggers when scrolled into view, eases out
 * over `duration`, and renders the final value immediately when the user
 * prefers reduced motion (or JS is unavailable).
 */
export function Counter({
  to,
  decimals = 0,
  suffix = "",
  duration = 1400,
  className,
  ariaLabel,
}: CounterProps) {
  const prefersReducedMotion = useReducedMotion();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.4 });
  const [value, setValue] = useState(prefersReducedMotion ? to : 0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!inView || prefersReducedMotion) {
      setValue(to);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(to * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [inView, to, duration, prefersReducedMotion]);

  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className} aria-label={ariaLabel ?? `${formatted}${suffix}`}>
      {formatted}
      {suffix}
    </span>
  );
}
