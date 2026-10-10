// src/components/marketing/SocialProof.tsx
"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";

const stats = [
  {
    to: 2400,
    suffix: "+",
    decimals: 0,
    label: "Analyses completed",
    aria: "2,400 plus analyses completed",
  },
  {
    to: 4.8,
    suffix: "",
    decimals: 1,
    label: "Average user rating",
    aria: "4.8 average user rating",
  },
  {
    to: 120,
    suffix: "+",
    decimals: 0,
    label: "Curated remedies",
    aria: "120 plus curated remedies",
  },
  {
    to: 100,
    suffix: "%",
    decimals: 0,
    label: "Free & private",
    aria: "100 percent free and private",
  },
];

export function SocialProof() {
  return (
    <section
      aria-label="MedAssist by the numbers"
      style={{
        paddingTop: "var(--space-16)",
        paddingBottom: "var(--space-16)",
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
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-tertiary)",
              marginBottom: "var(--space-10)",
            }}
          >
            Trusted for everyday health questions
          </p>
        </Reveal>
        <dl
          className="grid grid-cols-2 gap-6 text-center lg:grid-cols-4 lg:gap-8"
          style={{ margin: 0 }}
        >
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.08}>
              <div>
                <dt className="stat-premium-value" style={{ margin: 0 }}>
                  <Counter
                    to={stat.to}
                    decimals={stat.decimals}
                    suffix={stat.suffix}
                    ariaLabel={stat.aria}
                  />
                </dt>
                <dd className="stat-premium-label" style={{ margin: 0 }}>
                  {stat.label}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
