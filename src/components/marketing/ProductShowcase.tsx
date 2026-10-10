// src/components/marketing/ProductShowcase.tsx
"use client";

import { CheckCircle, ClipboardList, Cpu, Lightbulb, MessageCircle, Pill, Search, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";

const showcaseRows = [
  {
    icon: Search,
    title: "Analyze symptoms in plain language",
    description:
      "Select what you're feeling — or describe it in your own words — and get a structured, informational read: possible explanations, self-care ideas, and when to see a professional.",
    bullets: ["Structured, easy-to-scan results", "Warning flags surfaced clearly", "Saved to your private history"],
    mock: (
      <div className="mock-window">
        <div className="mock-window-bar">
          <span className="mock-window-dot" />
          <span className="mock-window-dot" />
          <span className="mock-window-dot" />
        </div>
        <div className="mock-window-body">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <ClipboardList size={18} style={{ color: "var(--primary)" }} aria-hidden="true" />
            <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>Your symptoms</strong>
          </div>
          {["Headache", "Sore throat", "Fatigue"].map((s) => (
            <div
              key={s}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                background: "var(--bg-secondary)",
                borderRadius: "var(--radius-md)",
                marginBottom: "8px",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              <CheckCircle size={14} style={{ color: "var(--success)" }} aria-hidden="true" />
              {s}
            </div>
          ))}
          <div
            style={{
              marginTop: "14px",
              padding: "12px 14px",
              borderRadius: "var(--radius-md)",
              background: "var(--info-bg)",
              border: "1px solid var(--info-border)",
              fontSize: "13px",
              color: "var(--text-secondary)",
            }}
          >
            <strong style={{ color: "var(--text-primary)" }}>Possible explanations</strong> — informational only, not a diagnosis.
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: MessageCircle,
    title: "Chat through your questions",
    description:
      "Not sure where to start? Ask follow-up questions in a natural conversation. The assistant stays humble, cites its limits, and escalates emergencies immediately.",
    bullets: ["Natural, follow-up friendly", "Honest about its limits", "Emergency escalation built in"],
    mock: (
      <div className="mock-window">
        <div className="mock-window-bar">
          <span className="mock-window-dot" />
          <span className="mock-window-dot" />
          <span className="mock-window-dot" />
        </div>
        <div className="mock-window-body">
          <div
            style={{
              alignSelf: "flex-start",
              maxWidth: "85%",
              padding: "10px 14px",
              borderRadius: "16px 16px 16px 4px",
              background: "var(--bg-secondary)",
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginBottom: "10px",
            }}
          >
            How long should a mild headache last?
          </div>
          <div
            style={{
              marginLeft: "auto",
              maxWidth: "85%",
              padding: "10px 14px",
              borderRadius: "16px 16px 4px 16px",
              background: "var(--gradient-cta)",
              color: "#fff",
              fontSize: "13px",
            }}
          >
            Most mild headaches ease within a day. Rest, hydrate, and monitor — if it worsens or comes with warning signs, please speak to a clinician.
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Pill,
    title: "Explore gentle, time-tested remedies",
    description:
      "Search the curated library by symptom, ingredient, or tradition. Every remedy includes preparation, usage, and precautions — so you can explore with confidence.",
    bullets: ["Preparation & usage guidance", "Precautions and contraindications", "Save favorites with notes"],
    mock: (
      <div className="mock-window">
        <div className="mock-window-bar">
          <span className="mock-window-dot" />
          <span className="mock-window-dot" />
          <span className="mock-window-dot" />
        </div>
        <div className="mock-window-body">
          <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>Ginger Honey Tea</strong>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: "6px 0 12px" }}>
            Soothing tea for cold, cough, and sore throat.
          </p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
            {["herbal", "2 min prep", "caffeine-free"].map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  background: "var(--gradient-brand-soft)",
                  color: "var(--primary)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              background: "var(--warning-bg)",
              border: "1px solid var(--warning-border)",
              fontSize: "12px",
              color: "var(--text-secondary)",
            }}
          >
            Avoid if allergic to ginger. Not for children under 1 year.
          </div>
        </div>
      </div>
    ),
  },
];

const steps = [
  { icon: ClipboardList, title: "Describe", description: "Tell us what you're feeling — by list, body map, or your own words." },
  { icon: Cpu, title: "Analyze", description: "AI organizes your input into a clear, informational picture." },
  { icon: Lightbulb, title: "Explore", description: "Read possible explanations and gentle remedy suggestions." },
  { icon: ShieldCheck, title: "Stay safe", description: "Warning signs and emergency guidance are always surfaced." },
];

export function ProductShowcase() {
  return (
    <section id="showcase" className="section-premium" style={{ background: "var(--bg-secondary)" }}>
      <div className="container">
        <Reveal>
          <SectionHeader
            eyebrow="Product"
            title={
              <>
                A product that feels <span className="text-gradient-premium">effortless</span>
              </>
            }
            description="Three surfaces, one calm experience — from first symptom to saved remedy."
          />
        </Reveal>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-20)" }}>
          {showcaseRows.map((row) => (
            <div key={row.title} className="showcase-row">
              <Reveal delay={0.1}>
                <div style={{ marginBottom: "var(--space-6)" }}>
                  <div className="bento-icon" aria-hidden="true">
                    <row.icon size={24} />
                  </div>
                  <h3
                    style={{
                      fontSize: "var(--text-2xl)",
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      marginBottom: "var(--space-4)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {row.title}
                  </h3>
                  <p style={{ fontSize: "var(--text-base)", color: "var(--text-secondary)", lineHeight: "var(--leading-relaxed)", marginBottom: "var(--space-6)" }}>
                    {row.description}
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                    {row.bullets.map((bullet) => (
                      <li key={bullet} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                        <CheckCircle size={16} style={{ color: "var(--success)", flexShrink: 0 }} aria-hidden="true" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal delay={0.2}>{row.mock}</Reveal>
            </div>
          ))}
        </div>

        {/* How it works — 4 steps */}
        <div style={{ marginTop: "var(--space-24)" }}>
          <Reveal>
            <SectionHeader
              eyebrow="How it works"
              title={
                <>
                  Four steps to <span className="text-gradient-premium">clarity</span>
                </>
              }
            />
          </Reveal>
          <div className="bento" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.1}>
                <div className="glass-card glass-card-hover" style={{ padding: "var(--space-8)", height: "100%", textAlign: "center" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      margin: "0 auto var(--space-4)",
                      borderRadius: "var(--radius-full)",
                      background: "var(--gradient-brand)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: 700,
                    }}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </div>
                  <div className="bento-icon" style={{ margin: "0 auto var(--space-4)" }} aria-hidden="true">
                    <step.icon size={22} />
                  </div>
                  <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, marginBottom: "var(--space-2)", color: "var(--text-primary)" }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", lineHeight: "var(--leading-relaxed)", margin: 0 }}>
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
