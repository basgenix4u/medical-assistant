// src/components/landing/CTA.tsx

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

const benefits = [
  "No account required to browse",
  "100% free to use",
  "Instant AI analysis",
  "Privacy protected",
];

export function CTA() {
  return (
    <section className="section">
      <div className="container">
        <motion.div
          className="cta-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative pattern overlay */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.1,
              backgroundImage:
                "radial-gradient(circle at 20% 30%, white 0%, transparent 40%), radial-gradient(circle at 80% 70%, white 0%, transparent 40%)",
              pointerEvents: "none",
            }}
          />

          {/* Content */}
          <div
            style={{
              position: "relative",
              maxWidth: "640px",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <motion.h2
              style={{
                fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                fontWeight: 700,
                marginBottom: "var(--space-4)",
                color: "white",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Ready to Take Control of Your Health?
            </motion.h2>

            <motion.p
              style={{
                fontSize: "var(--text-lg)",
                marginBottom: "var(--space-8)",
                color: "rgba(255, 255, 255, 0.9)",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Join users who trust MedAssist for general health information
              and traditional remedy suggestions.
            </motion.p>

            {/* Benefits */}
            <motion.div
              className="cta-benefits"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              {benefits.map((benefit) => (
                <div key={benefit} className="cta-benefit">
                  <CheckCircle size={16} aria-hidden="true" />
                  <span>{benefit}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href="/auth/signup"
                className="cta-button"
                style={{ textDecoration: "none" }}
              >
                Get Started Free
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
