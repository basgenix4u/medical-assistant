// src/components/marketing/BenefitsSection.tsx
"use client";

import { Clock, EyeOff, HeartHandshake, Wallet } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

const benefits = [
  {
    icon: Clock,
    title: "Clarity in minutes",
    description:
      "Skip the search spiral. Get a structured, readable summary of what might be going on and what to do next — in minutes, not hours.",
  },
  {
    icon: HeartHandshake,
    title: "Safety-first by design",
    description:
      "Emergency language triggers immediate escalation guidance, AI output is validated before it reaches you, and every result is labeled informational.",
  },
  {
    icon: EyeOff,
    title: "Private and yours",
    description:
      "Your symptoms and history are encrypted at rest, visible only to you, and exportable or deletable whenever you want. No ads. No trackers.",
  },
  {
    icon: Wallet,
    title: "Free, forever",
    description:
      "Core analysis, chat, and the remedies library are free. No subscriptions, no paywalls, no surprises.",
  },
];

export function BenefitsSection() {
  return (
    <section id="benefits" className="section-premium" aria-labelledby="benefits-heading">
      <div className="container">
        <Reveal>
          <SectionHeader
            eyebrow="Why MedAssist"
            title={
              <>
                Built for <span className="text-gradient-premium">real life</span>
              </>
            }
            description="The product people keep on their home screen — fast, honest, and respectful of your privacy."
          />
        </Reveal>

        <div className="bento bento-2">
          {benefits.map((benefit, index) => (
            <Reveal key={benefit.title} delay={index * 0.08}>
              <GlassCard style={{ padding: "var(--space-8)", height: "100%" }}>
                <div className="bento-icon" aria-hidden="true">
                  <benefit.icon size={24} />
                </div>
                <h3
                  style={{
                    fontSize: "var(--text-xl)",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    marginBottom: "var(--space-3)",
                    color: "var(--text-primary)",
                  }}
                >
                  {benefit.title}
                </h3>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--text-tertiary)",
                    lineHeight: "var(--leading-relaxed)",
                    margin: 0,
                  }}
                >
                  {benefit.description}
                </p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
