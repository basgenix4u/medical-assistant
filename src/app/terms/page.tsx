import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — MedAssist",
  description: "Terms of service for using MedAssist.",
};

export default function TermsPage() {
  return (
    <main style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 24px", color: "var(--text-secondary)" }}>
      <h1 style={{ color: "var(--text-primary)" }}>Terms of Service</h1>
      <p style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>
        Last updated: {new Date().toISOString().split("T")[0]}
      </p>

      <h2 style={{ color: "var(--text-primary)", marginTop: "32px" }}>1. Informational Only</h2>
      <p>
        MedAssist provides <strong>general health information and traditional
        remedy suggestions for educational purposes only</strong>. The
        service is NOT a substitute for professional medical advice,
        diagnosis, or treatment. Always seek the advice of a qualified
        healthcare provider with any questions you may have regarding a
        medical condition.
      </p>

      <h2 style={{ color: "var(--text-primary)", marginTop: "24px" }}>2. No Medical Relationship</h2>
      <p>
        Using MedAssist does not create a doctor–patient relationship.
        The AI behind MedAssist is an informational assistant, NOT a
        licensed medical professional. Any output is general guidance and
        may not be appropriate for your specific situation.
      </p>

      <h2 style={{ color: "var(--text-primary)", marginTop: "24px" }}>3. Emergencies</h2>
      <p>
        If you believe you are experiencing a medical emergency, do NOT
        rely on MedAssist. Call your local emergency number immediately:
      </p>
      <ul>
        <li>911 (United States, Canada)</li>
        <li>999 (United Kingdom)</li>
        <li>112 (European Union and many other regions)</li>
      </ul>

      <h2 style={{ color: "var(--text-primary)", marginTop: "24px" }}>4. Account Responsibilities</h2>
      <p>
        You are responsible for keeping your account credentials secure.
        Do not share your password. We strongly recommend using a unique
        password and enabling any available two-factor authentication.
      </p>

      <h2 style={{ color: "var(--text-primary)", marginTop: "24px" }}>5. Limitation of Liability</h2>
      <p>
        MedAssist is provided "as is" without warranties of any kind.
        The maintainers are not liable for any decisions made based on
        information provided by the service.
      </p>

      <h2 style={{ color: "var(--text-primary)", marginTop: "24px" }}>6. Changes</h2>
      <p>
        We may update these terms from time to time. Continued use of
        the service constitutes acceptance of the current terms.
      </p>

      <p style={{ marginTop: "40px" }}>
        <Link href="/" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>
          ← Back to home
        </Link>
      </p>
    </main>
  );
}
