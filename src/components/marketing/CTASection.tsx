// src/components/marketing/CTASection.tsx
"use client";

import { ArrowRight, CheckCircle } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { PremiumButton } from "@/components/ui/PremiumButton";

const chips = [
  "Free forever",
  "No ads, no trackers",
  "Export or delete your data",
  "Works on any device",
];

export function CTASection() {
  return (
    <section className="section-premium" aria-labelledby="cta-heading">
      <div className="container">
        <Reveal>
          <div className="cta-panel">
            <span className="eyebrow" style={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.22)", color: "#fff" }}>
              <span className="eyebrow-dot" style={{ background: "#fff" }} aria-hidden="true" />
              Get started
            </span>
            <h2
              id="cta-heading"
              style={{
                fontSize: "var(--text-h2)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#fff",
                marginBottom: "var(--space-4)",
              }}
            >
              Ready for a clearer head?
            </h2>
            <p
              style={{
                fontSize: "var(--text-lg)",
                color: "rgba(255, 255, 255, 0.88)",
                maxWidth: "560px",
                margin: "0 auto var(--space-8)",
                lineHeight: "var(--leading-relaxed)",
              }}
            >
              Join people who use MedAssist for calm, informed guidance on everyday
              symptoms — and keep their history private, forever.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "var(--space-3)",
                marginBottom: "var(--space-10)",
              }}
            >
              {chips.map((chip) => (
                <span key={chip} className="cta-chip">
                  <CheckCircle size={14} aria-hidden="true" />
                  {chip}
                </span>
              ))}
            </div>

            <PremiumButton href="/auth/signup" variant="light" size="lg">
              Create your free account
              <ArrowRight size={18} aria-hidden="true" />
            </PremiumButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
