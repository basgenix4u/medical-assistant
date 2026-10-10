// src/components/marketing/SocialProof.tsx
"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Award, Lock, Smartphone, Zap } from "lucide-react";

const proofs = [
  { icon: Zap, label: "Answers in minutes" },
  { icon: Lock, label: "Private by design" },
  { icon: Smartphone, label: "Installs like an app" },
  { icon: Award, label: "Free, forever" },
];

export function SocialProof() {
  return (
    <section
      aria-label="Why people trust MedAssist"
      style={{
        paddingTop: "var(--space-12)",
        paddingBottom: "var(--space-12)",
        borderTop: "1px solid var(--glass-border)",
        borderBottom: "1px solid var(--glass-border)",
        background: "var(--bg-secondary)",
      }}
    >
      <div className="container">
        <Reveal>
          <p
            style={{
              textAlign: "center",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
              marginBottom: "var(--space-8)",
            }}
          >
            Trusted for everyday health questions
          </p>
          <div className="logo-cloud">
            {proofs.map((item, index) => (
              <Reveal key={item.label} delay={index * 0.08}>
                <span className="logo-cloud-item">
                  <item.icon size={16} aria-hidden="true" />
                  {item.label}
                </span>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
