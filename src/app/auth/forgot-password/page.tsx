// src/app/auth/forgot-password/page.tsx

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      toast.error(error.message || "Failed to send reset email");
    } else {
      setSent(true);
      toast.success("Reset email sent!");
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      background: "var(--bg-primary)",
    },
    card: {
      width: "100%",
      maxWidth: "420px",
      background: "var(--bg-tertiary)",
      borderRadius: "20px",
      padding: "40px",
      border: "1px solid var(--border-light)",
    },
    iconWrapper: {
      width: "60px",
      height: "60px",
      borderRadius: "16px",
      background: "var(--accent)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 24px",
    },
    title: {
      fontSize: "24px",
      fontWeight: 600,
      textAlign: "center" as const,
      marginBottom: "8px",
      color: "var(--text-primary)",
    },
    subtitle: {
      textAlign: "center" as const,
      color: "var(--text-tertiary)",
      marginBottom: "32px",
      fontSize: "14px",
    },
    input: {
      width: "100%",
      padding: "14px 16px",
      fontSize: "15px",
      border: "1px solid var(--border-light)",
      borderRadius: "12px",
      background: "var(--bg-secondary)",
      marginBottom: "16px",
      outline: "none",
    },
    button: {
      width: "100%",
      padding: "14px",
      fontSize: "15px",
      fontWeight: 500,
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      background: "var(--primary)",
      color: "white",
      marginBottom: "16px",
    },
    backLink: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      color: "var(--text-tertiary)",
      textDecoration: "none",
      fontSize: "14px",
    },
    successIcon: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background: "#dcfce7",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 24px",
    },
  };

  if (sent) {
    return (
      <div style={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.card}
        >
          <div style={styles.successIcon}>
            <CheckCircle size={40} style={{ color: "#22c55e" }} />
          </div>
          <h1 style={styles.title}>Check Your Email</h1>
          <p style={styles.subtitle}>
            We&apos;ve sent a password reset link to <strong>{email}</strong>. Please check your inbox
            and follow the instructions.
          </p>
          <Link href="/auth/login" style={styles.backLink}>
            <ArrowLeft size={18} />
            Back to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.card}
      >
        <div style={styles.iconWrapper}>
          <Mail size={28} style={{ color: "var(--primary)" }} />
        </div>
        <h1 style={styles.title}>Forgot Password?</h1>
        <p style={styles.subtitle}>
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={styles.input}
            required
          />

          <button type="submit" disabled={loading} style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <Link href="/auth/login" style={styles.backLink}>
          <ArrowLeft size={18} />
          Back to Login
        </Link>
      </motion.div>
    </div>
  );
}