"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Check,
  AlertCircle,
  Shield,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

function SignupPageInner() {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithGithub } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);

  const passwordChecks = {
    length: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasLetter: /[a-zA-Z]/.test(password),
  };
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
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
    const { error } = await signUp(email, password, fullName);
    setLoading(false);

    if (error) {
      toast.error(error.message || "Failed to create account");
    } else {
      toast.success("Welcome to MedAssist!");
      router.push("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
      setLoadingGoogle(false);
    }
  };

  const handleGithubSignIn = async () => {
    setLoadingGithub(true);
    const { error } = await signInWithGithub();
    if (error) {
      toast.error(error.message);
      setLoadingGithub(false);
    }
  };

  const isOAuthLoading = loadingGoogle || loadingGithub;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background:
          "linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "var(--bg-tertiary)",
          borderRadius: "24px",
          padding: "40px",
          border: "1px solid var(--border-light)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        }}
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
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "8px",
            }}
          >
            Create your account
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "15px" }}>
            Start your journey to better health
          </p>
        </div>

        {/* Quick info */}
        <div
          role="note"
          style={{
            display: "flex",
            gap: "12px",
            padding: "12px 14px",
            background: "var(--info-bg)",
            border: "1px solid var(--info-border)",
            borderRadius: "10px",
            marginBottom: "20px",
            fontSize: "13px",
            color: "var(--text-secondary)",
          }}
        >
          <Shield
            size={16}
            style={{ color: "var(--info)", flexShrink: 0, marginTop: "2px" }}
            aria-hidden="true"
          />
          <span>
            Free forever. Your data is encrypted and only used to provide
            health information.
          </span>
        </div>

        {/* OAuth Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isOAuthLoading || loading}
            aria-label="Sign up with Google"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: 500,
              border: "1px solid var(--border-default)",
              borderRadius: "10px",
              cursor: isOAuthLoading || loading ? "not-allowed" : "pointer",
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              opacity: isOAuthLoading || loading ? 0.6 : 1,
              transition: "all 0.2s ease",
              fontFamily: "inherit",
            }}
          >
            {loadingGoogle ? (
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={handleGithubSignIn}
            disabled={isOAuthLoading || loading}
            aria-label="Sign up with GitHub"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: 500,
              border: "1px solid var(--border-default)",
              borderRadius: "10px",
              cursor: isOAuthLoading || loading ? "not-allowed" : "pointer",
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              opacity: isOAuthLoading || loading ? 0.6 : 1,
              transition: "all 0.2s ease",
              fontFamily: "inherit",
            }}
          >
            {loadingGithub ? (
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            )}
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div
            aria-hidden="true"
            style={{ flex: 1, height: "1px", background: "var(--border-light)" }}
          />
          <span
            style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 500 }}
          >
            OR
          </span>
          <div
            aria-hidden="true"
            style={{ flex: 1, height: "1px", background: "var(--border-light)" }}
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="full-name"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "6px",
                color: "var(--text-primary)",
              }}
            >
              Full name
            </label>
            <div style={{ position: "relative" }}>
              <User
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
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
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

          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="email"
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
                id="email"
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
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="password"
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
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                minLength={8}
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

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div style={{ marginTop: "8px" }}>
                <div
                  role="meter"
                  aria-label="Password strength"
                  aria-valuenow={passwordStrength}
                  aria-valuemin={0}
                  aria-valuemax={3}
                  style={{ display: "flex", gap: "4px", marginBottom: "8px" }}
                >
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      aria-hidden="true"
                      style={{
                        flex: 1,
                        height: "3px",
                        borderRadius: "2px",
                        background:
                          passwordStrength >= level
                            ? passwordStrength === 1
                              ? "var(--error)"
                              : passwordStrength === 2
                              ? "var(--warning)"
                              : "var(--success)"
                            : "var(--border-light)",
                        transition: "background 0.2s ease",
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    fontSize: "12px",
                  }}
                >
                  {[
                    { check: passwordChecks.length, label: "8+ characters" },
                    { check: passwordChecks.hasLetter, label: "A letter" },
                    { check: passwordChecks.hasNumber, label: "A number" },
                  ].map(({ check, label }) => (
                    <span
                      key={label}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        color: check ? "var(--success)" : "var(--text-tertiary)",
                      }}
                    >
                      {check && <Check size={11} aria-hidden="true" />}
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="confirm-password"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "6px",
                color: "var(--text-primary)",
              }}
            >
              Confirm password
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
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
                required
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 40px",
                  fontSize: "15px",
                  border: `1px solid ${
                    confirmPassword && confirmPassword !== password
                      ? "var(--error-border)"
                      : "var(--border-light)"
                  }`,
                  borderRadius: "10px",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              {confirmPassword && confirmPassword === password && (
                <Check
                  size={16}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--success)",
                  }}
                  aria-hidden="true"
                />
              )}
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p
                role="alert"
                style={{
                  color: "var(--error)",
                  fontSize: "12px",
                  marginTop: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <AlertCircle size={12} aria-hidden="true" />
                Passwords do not match
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || isOAuthLoading}
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
              cursor: loading || isOAuthLoading ? "not-allowed" : "pointer",
              opacity: loading || isOAuthLoading ? 0.6 : 1,
              transition: "all 0.2s ease",
              fontFamily: "inherit",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                Creating account...
              </>
            ) : (
              <>
                <Sparkles size={16} aria-hidden="true" />
                Create account
                <ArrowRight size={16} aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        {/* Terms */}
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "12px",
            color: "var(--text-tertiary)",
            lineHeight: 1.5,
          }}
        >
          By creating an account, you agree to our{" "}
          <Link href="/terms" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>
            Privacy Policy
          </Link>
        </p>

        {/* Sign In Link */}
        <p
          style={{
            textAlign: "center",
            marginTop: "16px",
            fontSize: "14px",
            color: "var(--text-tertiary)",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/auth/login"
            style={{
              color: "var(--primary)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <SignupPageInner />
    </Suspense>
  );
}
