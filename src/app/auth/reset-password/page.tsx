// src/app/auth/reset-password/page.tsx
"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

function ResetPasswordInner() {
  const { resetPasswordWithToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Missing reset token. Please request a new link.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await resetPasswordWithToken(token, password);
    setLoading(false);

    if (error) {
      toast.error(error.message || "Failed to reset password");
      return;
    }
    setSuccess(true);
    toast.success("Password updated. Please sign in.");
    setTimeout(() => router.push("/auth/login"), 2000);
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
    inputGroup: {
      marginBottom: "16px",
      position: "relative" as const,
    },
    input: {
      width: "100%",
      padding: "14px 44px 14px 16px",
      fontSize: "15px",
      border: "1px solid var(--border-light)",
      borderRadius: "12px",
      background: "var(--bg-secondary)",
      color: "var(--text-primary)",
      outline: "none",
    },
    eyeButton: {
      position: "absolute" as const,
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "var(--text-tertiary)",
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
    errorIcon: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background: "var(--warning-bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 24px",
    },
    link: {
      color: "var(--primary)",
      textDecoration: "none",
      fontWeight: 600,
    },
  };

  if (success) {
    return (
      <div style={styles.container}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.card}
        >
          <div style={styles.successIcon}>
            <CheckCircle size={40} style={{ color: "#22c55e" }} />
          </div>
          <h1 style={styles.title}>Password Updated!</h1>
          <p style={styles.subtitle}>
            Your password has been reset successfully. Redirecting to sign in…
          </p>
        </motion.div>
      </div>
    );
  }

  if (!token) {
    return (
      <div style={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.card}
        >
          <div style={styles.errorIcon}>
            <AlertCircle size={40} style={{ color: "#b45309" }} />
          </div>
          <h1 style={styles.title}>Invalid reset link</h1>
          <p style={styles.subtitle}>
            This password reset link is missing its token. Please request a new
            one.
          </p>
          <Link href="/auth/forgot-password" style={styles.link}>
            Request a new link
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
          <Lock size={28} style={{ color: "var(--primary)" }} />
        </div>
        <h1 style={styles.title}>Set New Password</h1>
        <p style={styles.subtitle}>
          Create a new password for your account. Make sure it&apos;s at least 8
          characters.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
              style={styles.input}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div style={styles.inputGroup}>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Updating…
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
