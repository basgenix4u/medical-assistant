// src/components/landing/Hero.tsx

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: "100px",
        paddingBottom: "80px",
      }}
    >
      <div className="container">
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
            <div className="badge" style={{ marginBottom: "24px" }}>
              <span className="badge-dot" />
              <span>AI-Powered Health Assistant</span>
            </div>

            {/* Heading */}
            <h1 style={{ marginBottom: "20px" }}>
              Your Intelligent{" "}
              <span className="text-gradient">Medical Assistant</span> for
              Natural Healing
            </h1>

            {/* Description */}
            <p
              style={{
                fontSize: "18px",
                color: "var(--text-secondary)",
                marginBottom: "32px",
                maxWidth: "520px",
                lineHeight: "1.7",
              }}
            >
              Analyze your symptoms with advanced AI and discover proven home
              remedies. Get personalized health recommendations instantly.
            </p>

            {/* Benefits List */}
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
              ].map((benefit) => (
                <div
                  key={benefit}
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <CheckCircle size={20} style={{ color: "var(--success)", flexShrink: 0 }} />
                  <span style={{ color: "var(--text-secondary)" }}>{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "48px",
              }}
            >
              <Link href="/dashboard" className="btn btn-primary btn-lg">
                Start Free Analysis
                <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="btn btn-secondary btn-lg">
                Learn More
              </a>
            </div>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                gap: "40px",
                paddingTop: "24px",
                borderTop: "1px solid var(--border-light)",
              }}
            >
              {[
                { value: "100+", label: "Remedies" },
                { value: "50+", label: "Symptoms" },
                { value: "Free", label: "To Use" },
              ].map((stat) => (
                <div key={stat.label}>
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
                  <div
                    style={{
                      fontSize: "14px",
                      color: "var(--text-tertiary)",
                      marginTop: "4px",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden md:block"
          >
            <div className="hero-preview-card">
              {/* Header */}
              <div className="hero-preview-header">
                <div className="hero-preview-icon">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", marginBottom: "2px" }}>
                    Symptom Checker
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>
                    AI-powered analysis
                  </p>
                </div>
              </div>

              {/* Symptoms */}
              {["Headache", "Fatigue", "Mild Fever"].map((symptom) => (
                <div key={symptom} className="hero-preview-symptom">
                  <CheckCircle size={18} style={{ color: "var(--success)" }} />
                  <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                    {symptom}
                  </span>
                </div>
              ))}

              {/* Result */}
              <div className="hero-preview-result">
                <div className="hero-preview-result-header">
                  <div className="hero-preview-result-dot" />
                  <h4>Analysis Complete</h4>
                </div>
                <p>3 natural remedies found for your symptoms</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}