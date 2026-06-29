// src/components/landing/Hero.tsx

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle, Sparkles, Shield } from "lucide-react";

export function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: "120px",
        paddingBottom: "80px",
        position: "relative",
        overflow: "hidden",
      }}
      aria-label="Hero"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at top right, var(--accent) 0%, transparent 50%), radial-gradient(ellipse at bottom left, var(--accent-light) 0%, transparent 50%)",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "48px",
            alignItems: "center",
          }}
          className="lg:grid-cols-2"
        >
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-light)",
                borderRadius: "9999px",
                marginBottom: "24px",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: "8px",
                  height: "8px",
                  background: "var(--success)",
                  borderRadius: "50%",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
                Free, no signup needed
              </span>
            </motion.div>

            <h1
              style={{
                fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
                marginBottom: "20px",
              }}
            >
              Your Intelligent{" "}
              <span className="text-gradient">Medical Assistant</span>
              <br />
              for Natural Healing
            </h1>

            <p
              style={{
                fontSize: "18px",
                color: "var(--text-secondary)",
                marginBottom: "32px",
                maxWidth: "540px",
                lineHeight: 1.7,
              }}
            >
              Analyze your symptoms with advanced AI and discover proven
              home remedies. Get personalized health recommendations
              instantly — all informational, with safety guardrails.
            </p>

            {/* Benefits */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "32px",
              }}
            >
              {[
                "AI-powered symptom analysis",
                "100+ natural remedies database",
                "Instant personalized recommendations",
                "Free forever — no credit card",
              ].map((benefit) => (
                <div
                  key={benefit}
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <CheckCircle
                    size={20}
                    style={{ color: "var(--success)", flexShrink: 0 }}
                    aria-hidden="true"
                  />
                  <span style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "40px",
              }}
            >
              <Link
                href="/auth/signup"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "14px 28px",
                  background: "var(--primary)",
                  color: "white",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "16px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 12px rgba(69, 40, 41, 0.2)",
                }}
              >
                <Sparkles size={18} aria-hidden="true" />
                Start Free Analysis
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a
                href="#how-it-works"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 28px",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "16px",
                  transition: "all 0.2s ease",
                }}
              >
                Learn How It Works
              </a>
            </div>

            {/* Trust */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                background: "var(--bg-secondary)",
                borderRadius: "10px",
                borderLeft: "3px solid var(--info)",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
              role="note"
            >
              <Shield size={16} style={{ color: "var(--info)", flexShrink: 0 }} aria-hidden="true" />
              <span>
                <strong>Informational only.</strong> Always consult a qualified
                healthcare provider for medical decisions.
              </span>
            </div>
          </motion.div>

          {/* Right Content - Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ position: "relative" }}
            className="hidden md:block"
          >
            {/* Floating decorative blobs */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "-30px",
                right: "-30px",
                width: "180px",
                height: "180px",
                background: "var(--accent)",
                borderRadius: "50%",
                filter: "blur(60px)",
                opacity: 0.6,
                zIndex: 0,
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: "-30px",
                left: "-30px",
                width: "160px",
                height: "160px",
                background: "var(--info-bg)",
                borderRadius: "50%",
                filter: "blur(60px)",
                opacity: 0.5,
                zIndex: 0,
              }}
            />

            <div
              className="hero-preview-card"
              style={{
                position: "relative",
                zIndex: 1,
                boxShadow: "0 20px 60px rgba(69, 40, 41, 0.15)",
              }}
            >
              <div className="hero-preview-header">
                <div className="hero-preview-icon">
                  <Sparkles size={22} aria-hidden="true" />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", marginBottom: "2px" }}>
                    Symptom Analysis
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>
                    Live preview
                  </p>
                </div>
              </div>

              {["Headache", "Fatigue", "Mild Fever"].map((symptom, i) => (
                <motion.div
                  key={symptom}
                  className="hero-preview-symptom"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                >
                  <CheckCircle
                    size={18}
                    style={{ color: "var(--success)" }}
                    aria-hidden="true"
                  />
                  <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                    {symptom}
                  </span>
                </motion.div>
              ))}

              <motion.div
                className="hero-preview-result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <div className="hero-preview-result-header">
                  <div
                    aria-hidden="true"
                    className="hero-preview-result-dot"
                  />
                  <h4>Analysis Complete</h4>
                </div>
                <p>3 natural remedies found</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "24px",
            paddingTop: "40px",
            marginTop: "40px",
            borderTop: "1px solid var(--border-light)",
          }}
        >
          {[
            { value: "100+", label: "Natural Remedies" },
            { value: "50+", label: "Symptoms Covered" },
            { value: "24/7", label: "AI Availability" },
            { value: "100%", label: "Free Forever" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "var(--primary)",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--text-tertiary)",
                  marginTop: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 500,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
