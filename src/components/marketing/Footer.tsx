// src/components/marketing/Footer.tsx
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Features", href: "/#features" },
    { label: "How it works", href: "/#showcase" },
    { label: "Testimonials", href: "/#testimonials" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
  ],
  resources: [
    { label: "Remedies library", href: "/dashboard/remedies" },
    { label: "AI chat", href: "/dashboard/chat" },
    { label: "GitHub", href: "https://github.com/basgenix4u/medical-assistant" },
    { label: "Author", href: "https://github.com/basgenix4u" },
  ],
  legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Medical Disclaimer", href: "/terms" },
    { label: "Emergency Info", href: "/terms#emergencies" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Github, href: "https://github.com/basgenix4u", label: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/abdulbasit-abdulalim-94a701354", label: "LinkedIn" },
  { icon: Mail, href: "mailto:contact@alimswrite.com", label: "Email" },
];

const linkStyle: React.CSSProperties = {
  color: "var(--text-tertiary)",
  textDecoration: "none",
  fontSize: "var(--text-sm)",
  lineHeight: 2,
};

const columnTitleStyle: React.CSSProperties = {
  fontSize: "var(--text-sm)",
  fontWeight: 700,
  color: "var(--text-primary)",
  marginBottom: "var(--space-4)",
  letterSpacing: "0.02em",
};

export function Footer() {
  return (
    <footer className="footer-premium">
      <div className="container">
        {/* Medical disclaimer — always visible */}
        <div
          role="note"
          aria-label="Medical disclaimer"
          style={{
            padding: "var(--space-4) var(--space-5)",
            background: "var(--warning-bg)",
            border: "1px solid var(--warning-border)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "var(--space-12)",
          }}
        >
          <p style={{ fontSize: "var(--text-sm)", color: "#92400e", lineHeight: "var(--leading-relaxed)", margin: 0 }}>
            <strong>Medical disclaimer:</strong> MedAssist provides informational content only and is
            not a substitute for professional medical advice, diagnosis, or treatment. In an emergency,
            call your local emergency number (911 in the US/Canada, 999 in the UK, 112 in the EU) immediately.
          </p>
        </div>

        <div className="footer-grid">
          {/* Brand */}
          <div>
            <Logo size="md" />
            <p
              style={{
                color: "var(--text-tertiary)",
                fontSize: "var(--text-sm)",
                marginTop: "var(--space-4)",
                marginBottom: "var(--space-6)",
                maxWidth: "300px",
                lineHeight: "var(--leading-relaxed)",
              }}
            >
              Calm, informed health guidance for everyday symptoms — private by design,
              free forever, and honest about its limits.
            </p>
            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--glass-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-tertiary)",
                  }}
                >
                  <social.icon size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <nav aria-label="Product links">
            <h3 style={columnTitleStyle}>Product</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} style={linkStyle}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Resource links">
            <h3 style={columnTitleStyle}>Resources</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} style={linkStyle}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal links">
            <h3 style={columnTitleStyle}>Legal</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} style={linkStyle}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid var(--glass-border)",
            paddingTop: "var(--space-6)",
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-4)",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: 0 }}>
            © {new Date().getFullYear()} MedAssist by Abdulbasit Abdulalim (ALIM CREATIVE). All rights reserved.
          </p>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: 0 }}>
            Informational only — not medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
