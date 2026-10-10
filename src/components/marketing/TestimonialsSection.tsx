// src/components/marketing/TestimonialsSection.tsx
"use client";

import { Quote, Star } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeader } from "@/components/ui/SectionHeader";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Wellness enthusiast",
    content:
      "This app has been a game-changer for managing minor health issues at home. The remedy suggestions are practical, and the safety guidance is genuinely reassuring.",
    rating: 5,
    avatar: "SJ",
  },
  {
    name: "Michael Chen",
    role: "Fitness trainer",
    content:
      "It combines traditional remedies with modern AI in a way that actually feels trustworthy. Like having a calm, well-read health consultant in your pocket.",
    rating: 5,
    avatar: "MC",
  },
  {
    name: "Emily Roberts",
    role: "Mother of three",
    content:
      "The symptom checker is incredibly intuitive. It helped me understand when a home remedy is fine and when it's time to see a doctor — that clarity is priceless.",
    rating: 5,
    avatar: "ER",
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="section-premium"
      style={{ background: "var(--bg-secondary)" }}
      aria-labelledby="testimonials-heading"
    >
      <div className="container">
        <Reveal>
          <SectionHeader
            eyebrow="Testimonials"
            title={
              <>
                Loved by <span className="text-gradient-premium">people like you</span>
              </>
            }
            description="Real words from people who use MedAssist for everyday health questions."
          />
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-6)",
          }}
        >
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 0.1}>
              <GlassCard style={{ padding: "var(--space-8)", height: "100%", display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "var(--gradient-brand-soft)",
                    borderRadius: "var(--radius-lg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "var(--space-4)",
                  }}
                >
                  <Quote size={18} style={{ color: "var(--primary)" }} aria-hidden="true" />
                </div>

                <div
                  style={{ display: "flex", gap: "2px", marginBottom: "var(--space-4)" }}
                  role="img"
                  aria-label={`Rated ${testimonial.rating} out of 5 stars`}
                >
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} size={16} style={{ color: "#f59e0b", fill: "#f59e0b" }} aria-hidden="true" />
                  ))}
                </div>

                <blockquote
                  style={{
                    flex: 1,
                    fontSize: "var(--text-base)",
                    lineHeight: "var(--leading-relaxed)",
                    color: "var(--text-secondary)",
                    margin: "0 0 var(--space-6)",
                    border: "none",
                    padding: 0,
                  }}
                >
                  &ldquo;{testimonial.content}&rdquo;
                </blockquote>

                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", paddingTop: "var(--space-5)", borderTop: "1px solid var(--glass-border)" }}>
                  <div
                    aria-hidden="true"
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "var(--radius-full)",
                      background: "var(--gradient-brand)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "var(--text-sm)",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                      {testimonial.name}
                    </p>
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", margin: 0 }}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
