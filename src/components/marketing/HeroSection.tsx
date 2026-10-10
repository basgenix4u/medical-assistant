// src/components/marketing/HeroSection.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { PremiumButton } from "@/components/ui/PremiumButton";

/** Expo-out easing curve (typed for framer-motion). */
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const highlights = [
  "AI-powered symptom analysis",
  "Curated natural remedies",
  "Private health history",
];

const stats = [
  { value: "100+", label: "Curated remedies" },
  { value: "24/7", label: "AI guidance" },
  { value: "Free", label: "Forever" },
];

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();

  const entrance = (delay: number) =>
    prefersReducedMotion
      ? {}
      : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: EASE_OUT_EXPO } };

  return (
    <section className="hero-premium" aria-labelledby="hero-heading">
      {/* Ambient background */}
      <div className="ambient-blob ambient-blob-1" aria-hidden="true" />
      <div className="ambient-blob ambient-blob-2" aria-hidden="true" />
      <div className="grid-overlay" aria-hidden="true" />

      <div className="container" style={{ position: "relative" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "64px",
            alignItems: "center",
          }}
          className="lg:grid-cols-2"
        >
          {/* Left: copy */}
          <div>
            <motion.div {...entrance(0)}>
              <span className="eyebrow">
                <span className="eyebrow-dot" aria-hidden="true" />
                Informational health assistant — not a doctor
              </span>
            </motion.div>

            <motion.h1 id="hero-heading" className="display-1" style={{ marginBottom: "24px" }} {...entrance(0.08)}>
              Your calm, informed path to{" "}
              <span className="text-gradient-premium">feeling better</span>
            </motion.h1>

            <motion.p
              style={{
                fontSize: "18px",
                color: "var(--text-secondary)",
                maxWidth: "520px",
                lineHeight: "1.7",
                marginBottom: "32px",
              }}
              {...entrance(0.16)}
            >
              MedAssist turns everyday symptoms into clear, informational guidance —
              AI-powered analysis, a curated library of traditional remedies, and a
              private history that&apos;s yours alone. Not a diagnosis. Peace of mind.
            </motion.p>

            <motion.div
              style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "36px" }}
              {...entrance(0.24)}
            >
              {highlights.map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <CheckCircle size={20} style={{ color: "var(--success)", flexShrink: 0 }} aria-hidden="true" />
                  <span style={{ color: "var(--text-secondary)", fontSize: "15px" }}>{item}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "48px" }}
              {...entrance(0.32)}
            >
              <PremiumButton href="/auth/signup" variant="primary" size="lg">
                Start a free analysis
                <ArrowRight size={18} aria-hidden="true" />
              </PremiumButton>
              <PremiumButton href="#showcase" variant="outline" size="lg">
                See how it works
              </PremiumButton>
            </motion.div>

            <motion.dl
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "40px",
                paddingTop: "28px",
                borderTop: "1px solid var(--glass-border)",
                margin: 0,
              }}
              {...entrance(0.4)}
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="stat-premium-value" style={{ margin: 0 }}>{stat.value}</dt>
                  <dd className="stat-premium-label" style={{ margin: 0 }}>{stat.label}</dd>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* Right: floating product preview */}
          <motion.div
            className="hidden md:block hero-preview"
            {...entrance(0.3)}
          >
            <div className="hero-preview-float">
              <div className="glass-card" style={{ padding: "var(--space-6)" }}>
                {/* Window header */}
                <div className="mock-window-bar" style={{ borderRadius: "var(--radius-lg) var(--radius-lg) 0 0", marginBottom: "var(--space-5)" }}>
                  <span className="mock-window-dot" />
                  <span className="mock-window-dot" />
                  <span className="mock-window-dot" />
                  <span style={{ marginLeft: "8px", fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 600 }}>
                    MedAssist · Symptom Checker
                  </span>
                </div>

                {/* Input mock */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "var(--space-5)" }}>
                  <div className="bento-icon" style={{ marginBottom: 0 }}>
                    <Sparkles size={22} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "16px", marginBottom: "2px" }}>Describe how you feel</h3>
                    <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: 0 }}>
                      Guided, private, and clear
                    </p>
                  </div>
                </div>

                {/* Symptom chips */}
                {["Headache", "Fatigue", "Mild fever"].map((symptom) => (
                  <div
                    key={symptom}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 14px",
                      background: "var(--bg-secondary)",
                      borderRadius: "var(--radius-md)",
                      marginBottom: "8px",
                    }}
                  >
                    <CheckCircle size={18} style={{ color: "var(--success)" }} aria-hidden="true" />
                    <span style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: "14px" }}>
                      {symptom}
                    </span>
                  </div>
                ))}

                {/* Result mock */}
                <div
                  style={{
                    marginTop: "var(--space-4)",
                    padding: "var(--space-4)",
                    background: "var(--success-bg)",
                    border: "1px solid var(--success-border)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <ShieldCheck size={16} style={{ color: "var(--success)" }} aria-hidden="true" />
                    <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>
                      Analysis ready — informational only
                    </strong>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                    3 gentle remedies suggested · see-a-doctor guidance included
                  </p>
                </div>
              </div>

              {/* Floating badge */}
              <div
                className="glass-card"
                style={{
                  position: "absolute",
                  bottom: "-24px",
                  left: "-24px",
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Stethoscope size={20} style={{ color: "var(--primary)" }} aria-hidden="true" />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                    Safety first
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                    Emergency guidance built in
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
