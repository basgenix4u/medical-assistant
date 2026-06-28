import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — MedAssist",
  description: "Privacy policy for MedAssist. How we handle your data.",
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px", color: "var(--text-secondary)" }}>
      <h1 style={{ color: "var(--text-primary)" }}>Privacy Policy</h1>
      <p style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>
        Last updated: {new Date().toISOString().split("T")[0]}
      </p>

      <h2 style={{ color: "var(--text-primary)", marginTop: "32px" }}>What we collect</h2>
      <ul>
        <li><strong>Account data:</strong> email, optional full name, optional date of birth, optional gender.</li>
        <li><strong>Health data you provide:</strong> symptom descriptions, severity, duration, medical conditions, allergies (all optional, all in your control).</li>
        <li><strong>Usage data:</strong> chat messages, analysis history, saved remedies, theme and notification preferences.</li>
      </ul>

      <h2 style={{ color: "var(--text-primary)", marginTop: "24px" }}>How we use it</h2>
      <p>
        Your data is used solely to provide MedAssist features to you
        (analyses, chat, history, saved remedies). We do not sell your
        data. We do not use your data to train third-party AI models.
      </p>

      <h2 style={{ color: "var(--text-primary)", marginTop: "24px" }}>Storage and security</h2>
      <p>
        Data is stored in a Supabase (Postgres) database with row-level
        security policies. Authentication tokens are stored in HTTP-only
        cookies. Passwords are stored using Supabase&apos;s bcrypt-based
        hashing. Network traffic is encrypted via HTTPS.
      </p>

      <h2 style={{ color: "var(--text-primary)", marginTop: "24px" }}>AI providers</h2>
      <p>
        Symptom analyses and chat messages are sent to a third-party
        AI provider (Groq / LLaMA) to generate responses. Your inputs
        are processed by that provider under their privacy terms.
        We do not send your email or account ID with AI requests.
      </p>

      <h2 style={{ color: "var(--text-primary)", marginTop: "24px" }}>Your rights</h2>
      <ul>
        <li><strong>Export:</strong> Download all your data as JSON from Settings → Privacy.</li>
        <li><strong>Delete:</strong> Delete your account and all associated data from Settings → Privacy.</li>
        <li><strong>Update:</strong> Edit your profile data from Profile or Settings.</li>
      </ul>

      <h2 style={{ color: "var(--text-primary)", marginTop: "24px" }}>Cookies</h2>
      <p>
        We use only essential cookies required for authentication and
        your saved theme preference. No third-party analytics or
        tracking cookies are used.
      </p>

      <h2 style={{ color: "var(--text-primary)", marginTop: "24px" }}>Children</h2>
      <p>
        MedAssist is not intended for users under 16. We do not knowingly
        collect data from children.
      </p>

      <h2 style={{ color: "var(--text-primary)", marginTop: "24px" }}>Contact</h2>
      <p>
        For privacy questions, contact us at{" "}
        <a href="https://github.com/basgenix4u/medical-assistant/issues" style={{ color: "var(--primary)" }}>
          GitHub Issues
        </a>.
      </p>

      <p style={{ marginTop: "40px" }}>
        <Link href="/" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>
          ← Back to home
        </Link>
      </p>
    </main>
  );
}
