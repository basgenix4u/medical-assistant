"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Shield,
  AlertCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const nextParam = searchParams.get("next");
  const errorMessage = errorParam ? `Sign-in error: ${errorParam}` : null;
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message || "Failed to sign in");
    } else {
      toast.success("Welcome back!");
      router.push(nextParam || "/dashboard");
    }
  };


  return (
    <div
      className="auth-page"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="auth-card"
      >
        {/* Logo */}
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

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "15px" }}>
            Sign in to continue to your account
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            style={{
              display: "flex",
              gap: "10px",
              padding: "12px 14px",
              background: "var(--warning-bg)",
              border: "1px solid var(--warning-border)",
              borderRadius: "10px",
              marginBottom: "20px",
              fontSize: "13px",
              color: "#854d0e",
              alignItems: "flex-start",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "1px" }} aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="login-email"
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
            <div style={{ position: "relative" }}>
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
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
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
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "8px" }}>
            <label
              htmlFor="login-password"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "6px",
                color: "var(--text-primary)",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
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
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                required
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 40px",
                  fontSize: "15px",
                  border: "1px solid var(--border-light)",
                  borderRadius: "10px",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-tertiary)",
                  padding: "4px",
                }}
              >
                {showPassword ? (
                  <EyeOff size={16} aria-hidden="true" />
                ) : (
                  <Eye size={16} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div style={{ textAlign: "right", marginBottom: "20px" }}>
            <Link
              href="/auth/forgot-password"
              style={{
                fontSize: "13px",
                color: "var(--primary)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
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
              fontFamily: "inherit",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight size={16} aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
            color: "var(--text-tertiary)",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            style={{
              color: "var(--primary)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Sign up
          </Link>
        </p>

        {/* Security footer */}
        <div
          style={{
            marginTop: "24px",
            padding: "12px",
            background: "var(--bg-secondary)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "12px",
            color: "var(--text-tertiary)",
          }}
        >
          <Shield size={14} style={{ color: "var(--primary)", flexShrink: 0 }} aria-hidden="true" />
          <span>Your password is hashed with bcrypt. We never store it in plain text.</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <LoginPageInner />
    </Suspense>
  );
}
