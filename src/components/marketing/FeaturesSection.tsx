// src/components/marketing/FeaturesSection.tsx
"use client";

import { Brain, BookOpen, History, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

const features = [
  {
    icon: Brain,
    title: "AI symptom analysis",
    description:
      "Describe your symptoms in plain language and receive a structured, informational analysis — possible explanations, self-care considerations, and clear warning signs. Never a diagnosis.",
    large: true,
  },
  {
    icon: BookOpen,
    title: "Curated remedies library",
    description:
      "Browse a hand-curated collection of traditional and home remedies with preparation steps, usage guidance, and precautions.",
  },
  {
    icon: MessageCircle,
    title: "Health chat, 24/7",
    description:
      "Ask general health questions in a friendly chat. The assistant is honest about its limits and always points you to professional care when it matters.",
  },
  {
    icon: History,
    title: "Your private history",
    description:
      "Every analysis is saved to your private dashboard so you can spot patterns, revisit guidance, and export or delete your data anytime.",
  },
  {
    icon: ShieldCheck,
    title: "Safety-first guardrails",
    description:
      "Emergency language triggers immediate escalation guidance, and every AI response is validated and clearly labeled as informational.",
  },
  {
    icon: Sparkles,
    title: "Made to feel effortless",
    description:
      "Fast, accessible, and installable — MedAssist works beautifully on a mid-range phone and respects your motion preferences.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="section-premium" aria-labelledby="features-heading">
      <div className="container">
        <Reveal>
          <SectionHeader
            eyebrow="Features"
            title={
              <>
                Everything you need for{" "}
                <span className="text-gradient-premium">everyday wellness</span>
              </>
            }
            description="A complete, privacy-first toolkit for understanding mild symptoms and exploring gentle, traditional remedies — with safety guardrails at every step."
          />
        </Reveal>

        <div className="bento">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.08} className={feature.large ? "bento-lg" : ""}>
              <GlassCard style={{ padding: "var(--space-8)", height: "100%" }}>
                <div className="bento-icon" aria-hidden="true">
                  <feature.icon size={24} />
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
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--text-tertiary)",
                    lineHeight: "var(--leading-relaxed)",
                    margin: 0,
                  }}
                >
                  {feature.description}
                </p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
