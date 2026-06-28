// src/components/landing/Features.tsx

"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Brain,
  Leaf,
  User,
  MessageCircle,
  History,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description:
      "Advanced AI analyzes your symptoms to provide informational insights and general health considerations.",
  },
  {
    icon: Leaf,
    title: "Natural Remedies",
    description:
      "Access a comprehensive database of traditional and home remedies from various cultures around the world.",
  },
  {
    icon: User,
    title: "Interactive Body Map",
    description:
      "Pinpoint your symptoms on an interactive body map for more accurate analysis and better recommendations.",
  },
  {
    icon: MessageCircle,
    title: "24/7 AI Chat Assistant",
    description:
      "Get general answers to your health questions anytime with our intelligent conversational assistant.",
  },
  {
    icon: History,
    title: "Health History Tracking",
    description:
      "Track your consultations and monitor your health patterns over time for better wellness management.",
  },
  {
    icon: Shield,
    title: "Safety First Approach",
    description:
      "Clear warnings and emergency escalation for serious symptoms that require immediate professional attention.",
  },
];

export function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section
      id="features"
      style={{
        paddingTop: "var(--space-20)",
        paddingBottom: "var(--space-20)",
        background: "var(--bg-secondary)",
      }}
    >
      <div className="container">
        {/* Section Header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              background: "var(--accent)",
              borderRadius: "9999px",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 500,
                color: "var(--primary)",
              }}
            >
              Features
            </span>
          </div>
          <h2>
            Everything You Need for{" "}
            <span className="text-gradient">Natural Wellness</span>
          </h2>
          <p>
            Our comprehensive platform combines cutting-edge AI technology with
            centuries of traditional healing wisdom — all informational,
            always with safety guardrails.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div
          ref={ref}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-6)",
          }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="feature-card-icon">
                <feature.icon size={24} aria-hidden="true" />
              </div>
              <h3
                style={{
                  fontSize: "var(--text-xl)",
                  fontWeight: 600,
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
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "var(--space-6)",
            marginTop: "var(--space-16)",
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          {[
            { value: "100+", label: "Home Remedies" },
            { value: "50+", label: "Symptoms Covered" },
            { value: "24/7", label: "AI Availability" },
            { value: "Free", label: "To Use" },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
