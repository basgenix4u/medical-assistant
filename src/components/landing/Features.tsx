// src/components/landing/Features.tsx

"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Leaf,
  User,
  MessageCircle,
  History,
  Shield,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description:
      "Our AI analyzes your symptoms and provides informational insights. NOT a diagnosis — always consult a clinician.",
    color: "#7c3aed",
  },
  {
    icon: Leaf,
    title: "Natural Remedies Library",
    description:
      "Browse 100+ traditional and home remedies from cultures around the world, with preparation details.",
    color: "#16a34a",
  },
  {
    icon: User,
    title: "Interactive Body Map",
    description:
      "Pinpoint your symptoms visually on an interactive body map for more contextual analysis.",
    color: "#2563eb",
  },
  {
    icon: MessageCircle,
    title: "AI Chat Assistant",
    description:
      "Ask general health questions anytime and get thoughtful informational responses.",
    color: "#db2777",
  },
  {
    icon: History,
    title: "Health History",
    description:
      "Track your consultations and monitor patterns over time. Export your data anytime.",
    color: "#ea580c",
  },
  {
    icon: Shield,
    title: "Safety First",
    description:
      "Automatic emergency detection. If symptoms suggest danger, we show emergency-services contacts first.",
    color: "#dc2626",
  },
];

export function Features() {
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
              padding: "6px 14px",
              background: "var(--bg-tertiary)",
              borderRadius: "9999px",
              border: "1px solid var(--border-light)",
              marginBottom: "16px",
            }}
          >
            <Sparkles size={14} style={{ color: "var(--primary)" }} aria-hidden="true" />
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--primary)" }}>
              Features
            </span>
          </div>
          <h2>
            Everything You Need for{" "}
            <span className="text-gradient">Natural Wellness</span>
          </h2>
          <p>
            Our comprehensive platform combines cutting-edge AI technology with
            centuries of traditional healing wisdom — all informational, always
            with safety guardrails.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
          }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="feature-card"
              style={{ position: "relative", overflow: "hidden" }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "100px",
                  height: "100px",
                  background: feature.color,
                  opacity: 0.05,
                  borderRadius: "50%",
                  filter: "blur(40px)",
                  pointerEvents: "none",
                }}
              />
              <div
                className="feature-card-icon"
                style={{ background: `${feature.color}15`, color: feature.color }}
              >
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "var(--space-12)",
          }}
        >
          <Link
            href="/auth/signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              background: "var(--bg-tertiary)",
              color: "var(--primary)",
              border: "1px solid var(--border-default)",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "15px",
            }}
          >
            Try all features free
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
