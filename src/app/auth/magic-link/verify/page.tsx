"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Loader2, Mail } from "lucide-react";
import toast from "react-hot-toast";

function MagicLinkInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState(token ? "Signing you in..." : "No token provided");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This magic link is invalid or has expired.");
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/local/auth/magic-link/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setStatus("error");
          setMessage(data.error?.message || "Invalid or expired link");
          return;
        }
        setStatus("success");
        setMessage("Signed in! Redirecting...");
        toast.success("Welcome!");
        setTimeout(() => router.push("/dashboard"), 800);
      } catch (err) {
        setStatus("error");
        setMessage("Verification failed. Please try again.");
      }
    })();
  }, [token, router]);

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
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
            marginBottom: "32px",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: "44px",
              height: "44px",
              background: "var(--primary)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: "20px",
            }}
          >
            M
          </div>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--primary)" }}>
            MedAssist
          </span>
        </Link>

        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background:
              status === "success"
                ? "var(--success-bg)"
                : status === "error"
                ? "var(--error-bg)"
                : "var(--bg-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            color:
              status === "success"
                ? "var(--success)"
                : status === "error"
                ? "var(--error)"
                : "var(--primary)",
          }}
        >
          {status === "loading" && (
            <Loader2 size={32} className="animate-spin" aria-hidden="true" />
          )}
          {status === "success" && (
            <CheckCircle size={36} aria-hidden="true" />
          )}
          {status === "error" && (
            <AlertCircle size={36} aria-hidden="true" />
          )}
        </div>

        <h1
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "8px",
          }}
        >
          {status === "loading" && "Signing you in..."}
          {status === "success" && "Welcome back!"}
          {status === "error" && "Link expired"}
        </h1>

        <p style={{ color: "var(--text-tertiary)", fontSize: "15px", marginBottom: "24px" }}>
          {message}
        </p>

        {status === "error" && (
          <Link
            href="/auth/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              background: "var(--primary)",
              color: "white",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "15px",
            }}
          >
            <Mail size={16} aria-hidden="true" />
            Request a new link
          </Link>
        )}

        <p
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            marginTop: "32px",
          }}
        >
          <Link href="/" style={{ color: "var(--primary)", textDecoration: "none" }}>
            ← Back to home
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
