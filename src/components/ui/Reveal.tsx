// src/components/ui/Reveal.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import type { ReactNode } from "react";

/** Expo-out easing curve (typed for framer-motion). */
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in seconds. */
  delay?: number;
  /** Initial vertical offset in px. */
  y?: number;
  className?: string;
  once?: boolean;
}

/**
 * Scroll-reveal wrapper. Staggers naturally via `delay`, and renders
 * statically (no motion) when the user prefers reduced motion.
 */
export function Reveal({ children, delay = 0, y = 24, className, once = true }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const [ref, inView] = useInView({ triggerOnce: once, threshold: 0.15 });

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
}
