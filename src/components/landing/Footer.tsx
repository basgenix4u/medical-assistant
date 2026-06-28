// src/components/landing/Footer.tsx

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import {
  Heart,
  Github,
  Twitter,
  Linkedin,
  Mail,
  ArrowUpRight,
} from "lucide-react";

const footerLinks = {
  product: [
    { label: "Features", href: "/#features" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Remedies", href: "/dashboard/remedies" },
    { label: "AI Chat", href: "/dashboard/chat" },
  ],
  resources: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "GitHub", href: "https://github.com/basgenix4u/medical-assistant" },
    { label: "Contact", href: "https://github.com/basgenix4u" },
  ],
  legal: [
    { label: "Medical Disclaimer", href: "/terms" },
    { label: "Data & Privacy", href: "/privacy" },
    { label: "Emergency Info", href: "/terms#emergencies" },
    { label: "Cookie Policy", href: "/privacy#cookies" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Github, href: "https://github.com/basgenix4u", label: "GitHub" },
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/abdulbasit-abdulalim-94a701354",
    label: "LinkedIn",
  },
  { icon: Mail, href: "mailto:contact@alimswrite.com", label: "Email" },
];

export function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-tertiary)",
        borderTop: "1px solid var(--border-light)",
        paddingTop: "var(--space-16)",
        paddingBottom: "var(--space-8)",
      }}
    >
      <div className="container">
        {/* Main Footer Content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "var(--space-12)",
            marginBottom: "var(--space-12)",
          }}
          className="footer-grid"
        >
          {/* Brand Column */}
          <div>
            <Logo size="md" />
            <p
              style={{
                color: "var(--text-tertiary)",
                fontSize: "var(--text-sm)",
                marginTop: "var(--space-4)",
                marginBottom: "var(--space-6)",
                maxWidth: "280px",
              }}
            >
              Your intelligent health companion for symptom analysis and natural
              remedy recommendations. Empowering you to make informed health
              decisions.
            </p>

            {/* Social Links */}
            <div style={{ display: "flex", gap: "12px" }}>
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: "var(--bg-secondary)",
                    color: "var(--text-tertiary)",
                    border: "1px solid var(--border-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    transition: "all var(--transition-base)",
                  }}
                  whileHover={{
                    background: "var(--primary)",
                    color: "white",
                    scale: 1.05,
                    y: -2,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon size={18} aria-hidden="true" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                marginBottom: "var(--space-4)",
                color: "var(--text-primary)",
              }}
            >
              Product
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {footerLinks.product.map((link) => (
                <li key={link.label} style={{ marginBottom: "var(--space-3)" }}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--text-tertiary)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "color var(--transition-fast)",
                    }}
                  >
                    {link.label}
                    <ArrowUpRight
                      size={12}
                      style={{ opacity: 0.6 }}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                marginBottom: "var(--space-4)",
                color: "var(--text-primary)",
              }}
            >
              Resources
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {footerLinks.resources.map((link) => (
                <li key={link.label} style={{ marginBottom: "var(--space-3)" }}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--text-tertiary)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "color var(--transition-fast)",
                    }}
                  >
                    {link.label}
                    <ArrowUpRight
                      size={12}
                      style={{ opacity: 0.6 }}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                marginBottom: "var(--space-4)",
                color: "var(--text-primary)",
              }}
            >
              Legal
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {footerLinks.legal.map((link) => (
                <li key={link.label} style={{ marginBottom: "var(--space-3)" }}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--text-tertiary)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "color var(--transition-fast)",
                    }}
                  >
                    {link.label}
                    <ArrowUpRight
                      size={12}
                      style={{ opacity: 0.6 }}
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div
          style={{
            padding: "var(--space-4)",
            background: "var(--warning-bg)",
            border: "1px solid #fde68a",
            borderRadius: "var(--radius-lg)",
            marginBottom: "var(--space-8)",
          }}
          role="note"
        >
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "#92400e",
              lineHeight: "var(--leading-relaxed)",
              margin: 0,
            }}
          >
            <strong>Medical Disclaimer:</strong> This application provides
            general health information for educational purposes only. It is
            not a substitute for professional medical advice, diagnosis, or
            treatment. If you believe you are experiencing a medical
            emergency, call your local emergency number (911 in the US,
            999 in the UK, 112 in the EU) immediately.
          </p>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "var(--space-6)",
            borderTop: "1px solid var(--border-light)",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--text-tertiary)",
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} MedAssist. All rights reserved.
          </p>
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--text-tertiary)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              margin: 0,
            }}
          >
            Built by Abdulbasit Abdulalim{" "}
            <Heart
              size={14}
              style={{ color: "#dc2626", fill: "#dc2626" }}
              aria-hidden="true"
            />{" "}
            for better health
          </p>
        </div>
      </div>
    </footer>
  );
}
