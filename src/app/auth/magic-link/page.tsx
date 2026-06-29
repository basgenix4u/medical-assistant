"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

function MagicLinkInner() {
  const { signInWithMagicLink } = useAuth();
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
    const { error } = await signInWithMagicLink(email);
    setLoading(false);
    if (error) {
      toast.error(error.message || "Failed to send magic link");
    } else {
      setSent(true);
      toast.success("Magic link sent! Check your email.");
    }
  };

  if (sent) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            width: "100%",
            maxWidth: "440px",
            background: "var(--bg-tertiary)",
            borderRadius: "20px",
            padding: "40px",
            border: "1px solid var(--border-light)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "var(--success-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              color: "var(--success)",
            }}
          >
            <CheckCircle size={36} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>
            Check your email
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "15px", marginBottom: "20px" }}>
            We sent a magic sign-in link to <strong>{email}</strong>.
          </p>
          <div
            role="note"
            style={{
              padding: "14px",
              background: "var(--info-bg)",
              border: "1px solid var(--info-border)",
              borderRadius: "10px",
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginBottom: "24px",
            }}
          >
            <strong>Tip:</strong> In dev mode, the link is logged to your server
            console. Check <code>npm run dev</code> output.
          </div>
          <Link
            href="/auth/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--primary)",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "var(--bg-tertiary)",
          borderRadius: "20px",
          padding: "40px",
          border: "1px solid var(--border-light)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "24px",
            textDecoration: "none",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: "48px",
              height: "48px",
              background: "var(--primary)",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: "22px",
            }}
          >
            M
          </div>
          <span
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--primary)",
            }}
          >
            MedAssist
          </span>
        </Link>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            aria-hidden="true"
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "var(--primary)",
            }}
          >
            <Mail size={28} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
            Sign in with email
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "15px" }}>
            We&apos;ll send you a magic link. No password needed.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="magic-email"
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 500,
              marginBottom: "6px",
              color: "var(--text-primary)",
            }}
          >
            Email address
          </label>
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <Mail
              size={16}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-tertiary)",
              }}
              aria-hidden="true"
            />
            <input
              id="magic-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              required
              style={{
                width: "100%",
                padding: "12px 14px 12px 40px",
                fontSize: "15px",
                border: "1px solid var(--border-light)",
                borderRadius: "10px",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px 24px",
              fontSize: "15px",
              fontWeight: 600,
              background: "var(--primary)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "all 0.2s ease",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                Sending...
              </>
            ) : (
              <>
                <Sparkles size={16} aria-hidden="true" />
                Send magic link
              </>
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
            color: "var(--text-tertiary)",
          }}
        >
          Prefer password?{" "}
          <Link
            href="/auth/login"
            style={{
              color: "var(--primary)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Sign in with password
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <MagicLinkInner />
    </Suspense>
  );
}
