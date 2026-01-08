// src/app/(dashboard)/page.tsx

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Stethoscope,
  Leaf,
  MessageCircle,
  Activity,
  TrendingUp,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const quickActions = [
  {
    href: "/dashboard/analyze",
    icon: Stethoscope,
    title: "Symptom Checker",
    description: "Analyze your symptoms with AI",
    color: "#452829",
  },
  {
    href: "/dashboard/remedies",
    icon: Leaf,
    title: "Browse Remedies",
    description: "Explore natural remedies",
    color: "#16a34a",
  },
  {
    href: "/dashboard/chat",
    icon: MessageCircle,
    title: "AI Chat",
    description: "Ask health questions",
    color: "#2563eb",
  },
];

const stats = [
  { label: "Remedies Available", value: "100+", icon: Leaf },
  { label: "Symptoms Covered", value: "50+", icon: Activity },
  { label: "AI Responses", value: "24/7", icon: Clock },
];

const recentSymptoms = ["Headache", "Fatigue", "Sore Throat", "Mild Fever"];

export default function DashboardPage() {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "32px" }}
      >
        <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>{greeting()}!</h1>
        <p style={{ color: "var(--text-tertiary)", fontSize: "16px" }}>
          How can we help you today?
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: "32px" }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
          Quick Actions
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {quickActions.map((action, index) => (
            <Link
              key={action.href}
              href={action.href}
              style={{ textDecoration: "none" }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ y: -4 }}
                style={{
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "16px",
                  padding: "24px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: `${action.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <action.icon size={24} style={{ color: action.color }} />
                </div>
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: 600,
                    marginBottom: "6px",
                    color: "var(--text-primary)",
                  }}
                >
                  {action.title}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-tertiary)",
                  }}
                >
                  {action.description}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: "32px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-light)",
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <stat.icon size={22} style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "var(--primary)",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-tertiary)", marginTop: "4px" }}>
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
        }}
        className="grid-2"
      >
        {/* Start Analysis Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: "var(--primary)",
            borderRadius: "16px",
            padding: "28px",
            color: "white",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <Sparkles size={24} />
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px", color: "white" }}>
            Start New Analysis
          </h3>
          <p style={{ fontSize: "14px", opacity: 0.85, marginBottom: "20px", lineHeight: 1.6 }}>
            Get AI-powered insights about your symptoms and discover natural remedies.
          </p>
          <Link
            href="/dashboard/analyze"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              background: "white",
              color: "var(--primary)",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Start Now
            <ChevronRight size={18} />
          </Link>
        </motion.div>

        {/* Common Symptoms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border-light)",
            borderRadius: "16px",
            padding: "28px",
          }}
        >
          <h3 style={{ fontSize: "17px", fontWeight: 600, marginBottom: "16px" }}>
            Common Symptoms
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {recentSymptoms.map((symptom) => (
              <Link
                key={symptom}
                href={`/dashboard/analyze?symptom=${encodeURIComponent(symptom)}`}
                style={{
                  padding: "10px 16px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                {symptom}
              </Link>
            ))}
          </div>
          <Link
            href="/dashboard/analyze"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "20px",
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--primary)",
              textDecoration: "none",
            }}
          >
            View all symptoms
            <ChevronRight size={16} />
          </Link>
        </motion.div>
      </div>

      {/* Health Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          marginTop: "24px",
          padding: "20px 24px",
          background: "var(--success-bg)",
          border: "1px solid #bbf7d0",
          borderRadius: "12px",
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "#16a34a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <TrendingUp size={20} color="white" />
        </div>
        <div>
          <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#166534", marginBottom: "4px" }}>
            Daily Health Tip
          </h4>
          <p style={{ fontSize: "14px", color: "#166534", lineHeight: 1.6 }}>
            Stay hydrated! Drinking 8 glasses of water daily helps maintain energy levels and
            supports your immune system.
          </p>
        </div>
      </motion.div>
    </div>
  );
}