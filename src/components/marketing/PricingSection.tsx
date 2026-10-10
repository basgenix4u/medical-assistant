// src/components/marketing/PricingSection.tsx
"use client";

import { ArrowRight, Check, Lock, ShieldCheck, Zap } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PremiumButton } from "@/components/ui/PremiumButton";

const included = [
  "AI-powered symptom analysis",
  "24/7 health chat assistant",
  "Curated natural remedies library",
  "Private history & health insights",
  "Installable app (PWA) on any device",
  "Export or delete your data anytime",
];

const reassurance = [
  {
    icon: Lock,
    title: "Your data stays yours",
    text: "Encrypted, never sold, never used for ads. Delete everything with one tap.",
  },
  {
    icon: ShieldCheck,
    title: "Safety-first guardrails",
    text: "Emergency escalation built in; every AI response labeled informational.",
  },
  {
    icon: Zap,
    title: "Set up in under a minute",
    text: "Email and password — no credit card, no trial, nothing to cancel.",
  },
];

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="section-premium"
      style={{ background: "var(--bg-secondary)" }}
      aria-labelledby="pricing-heading"
    >
      <div className="container">
        <Reveal>
          <SectionHeader
            eyebrow="Pricing"
            title={
              <>
                One plan. <span className="text-gradient-premium">$0.</span>
              </>
            }
            description="MedAssist is free — because clear health information shouldn't depend on your wallet. Everything is included, forever."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="pricing-wrap">
            <div className="pricing-card">
              <span className="pricing-ribbon">Free forever</span>
              <p className="pricing-plan-name">MedAssist</p>
              <div className="price-row">
                <span className="price-amount">$0</span>
                <span className="price-period">/ forever</span>
              </div>
              <p className="pricing-tagline">Everything included. Nothing locked.</p>

              <ul className="check-list">
                {included.map((item) => (
                  <li key={item} className="check-list-item">
                    <span className="check-list-icon" aria-hidden="true">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <PremiumButton href="/auth/signup" variant="primary" size="lg">
                Create your free account
                <ArrowRight size={18} aria-hidden="true" />
              </PremiumButton>
              <p className="pricing-note">No credit card · No trial · No catch</p>
            </div>
          </div>
        </Reveal>

        <div className="reassurance-grid">
          {reassurance.map((item, index) => (
            <Reveal key={item.title} delay={0.15 + index * 0.08}>
              <div className="reassurance-item">
                <div className="bento-icon" style={{ marginBottom: 0 }} aria-hidden="true">
                  <item.icon size={20} />
                </div>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
