// src/app/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Stethoscope,
  Leaf,
  MessageCircle,
  Clock,
  ChevronRight,
  Sparkles,
  Activity,
  Heart,
  TrendingUp,
  Shield,
  AlertCircle,
} from "lucide-react";
import { getConsultations } from "@/lib/database";

interface RecentConsultation {
  id: string;
  symptoms: string[];
  created_at?: string;
  severity_level?: number;
  ai_severity?: string;
}

export default function DashboardPage() {
  const [recent, setRecent] = useState<RecentConsultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string>("");

  useEffect(() => {
    // Get user's first name from localStorage (set by auth-context)
    try {
      const stored = localStorage.getItem("medassist-profile-cache");
      if (stored) {
        const p = JSON.parse(stored) as { full_name?: string };
        if (p.full_name) setFirstName(p.full_name.split(" ")[0]);
      }
    } catch { /* ignore */ }

    (async () => {
      try {
        const { data } = await getConsultations(5);
        if (Array.isArray(data)) setRecent(data as RecentConsultation[]);
      } catch {
        /* empty state fine */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const stats = [
    { label: "Analyses", value: recent.length, icon: Activity, color: "var(--info)" },
    { label: "Remedies", value: "100+", icon: Leaf, color: "var(--success)" },
    { label: "Symptoms", value: "50+", icon: Heart, color: "var(--primary)" },
    { label: "AI uptime", value: "24/7", icon: TrendingUp, color: "var(--warning)" },
  ];

  const quickActions = [
    {
      href: "/dashboard/analyze",
      icon: Stethoscope,
      title: "Check Symptoms",
      description: "AI-powered symptom analysis with informational guidance",
      color: "var(--primary)",
    },
    {
      href: "/dashboard/remedies",
      icon: Leaf,
      title: "Browse Remedies",
      description: "100+ natural remedies with preparation details",
      color: "var(--success)",
    },
    {
      href: "/dashboard/chat",
      icon: MessageCircle,
      title: "Ask AI",
      description: "General health questions answered conversationally",
      color: "var(--info)",
    },
  ];

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: "32px" }}
      >
        <h1 style={{ fontSize: "32px", marginBottom: "8px", fontWeight: 700 }}>
          {greeting()}{firstName ? `, ${firstName}` : ""}! 👋
        </h1>
        <p style={{ color: "var(--text-tertiary)", fontSize: "16px" }}>
          What would you like to learn about today?
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-light)",
              borderRadius: "16px",
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: `${stat.color}15`,
                color: stat.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <stat.icon size={22} aria-hidden="true" />
            </div>
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--text-tertiary)",
                  marginTop: "4px",
                }}
              >
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Two-column grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
          gap: "24px",
        }}
        className="grid-2"
      >
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              marginBottom: "16px",
              color: "var(--text-primary)",
            }}
          >
            Quick Actions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {quickActions.map((action, index) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.05 }}
              >
                <Link
                  href={action.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "20px",
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "16px",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                  className="card-hover"
                >
                  <div
                    aria-hidden="true"
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "14px",
                      background: `${action.color}15`,
                      color: action.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <action.icon size={26} aria-hidden="true" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginBottom: "2px",
                      }}
                    >
                      {action.title}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {action.description}
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    style={{ color: "var(--text-tertiary)" }}
                    aria-hidden="true"
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent + Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {/* Recent activity */}
          <div
            style={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-light)",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                Recent Activity
              </h2>
              <Link
                href="/dashboard/history"
                style={{
                  fontSize: "13px",
                  color: "var(--primary)",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                View all →
              </Link>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-tertiary)", fontSize: "13px" }}>
                Loading...
              </div>
            ) : recent.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <Clock
                  size={32}
                  style={{
                    color: "var(--text-tertiary)",
                    margin: "0 auto 8px",
                    display: "block",
                  }}
                  aria-hidden="true"
                />
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-tertiary)",
                    margin: 0,
                  }}
                >
                  No analyses yet
                </p>
                <Link
                  href="/dashboard/analyze"
                  style={{
                    display: "inline-block",
                    marginTop: "12px",
                    fontSize: "13px",
                    color: "var(--primary)",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  Start your first →
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {recent.slice(0, 3).map((c) => (
                  <Link
                    key={c.id}
                    href="/dashboard/history"
                    style={{
                      display: "block",
                      padding: "12px 14px",
                      background: "var(--bg-secondary)",
                      borderRadius: "10px",
                      textDecoration: "none",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "var(--text-primary)",
                        marginBottom: "4px",
                        textTransform: "capitalize",
                      }}
                    >
                      {Array.isArray(c.symptoms)
                        ? c.symptoms.slice(0, 2).join(", ")
                        : "Analysis"}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString()
                        : "Recent"}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Daily health tip */}
          <div
            style={{
              background: "var(--success-bg)",
              border: "1px solid var(--success-border)",
              borderRadius: "16px",
              padding: "20px",
              display: "flex",
              gap: "14px",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "var(--success)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Sparkles size={20} aria-hidden="true" />
            </div>
            <div>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#166534",
                  marginBottom: "4px",
                }}
              >
                Daily Tip
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "#166534",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Drink 8 glasses of water daily — supports energy and immunity.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        role="note"
        style={{
          marginTop: "32px",
          padding: "16px 20px",
          background: "var(--bg-secondary)",
          borderLeft: "3px solid var(--warning)",
          borderRadius: "10px",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          fontSize: "13px",
          color: "var(--text-secondary)",
        }}
      >
        <AlertCircle
          size={18}
          style={{ color: "var(--warning)", flexShrink: 0, marginTop: "1px" }}
          aria-hidden="true"
        />
        <span>
          MedAssist provides <strong>informational content only</strong>. It is not
          a medical diagnosis. Always consult a qualified healthcare provider.
          In an emergency, call 911 (US), 999 (UK), or 112 (EU).
        </span>
      </motion.div>
    </div>
  );
}
