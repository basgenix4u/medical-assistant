// src/app/auth/signup/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import toast from "react-hot-toast";

// Google Icon
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// GitHub Icon
const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

export default function SignupPage() {
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

  // Password strength indicators
  const passwordChecks = {
    length: password.length >= 6,
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

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
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
      toast.success("Account created successfully!");
      router.push("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message || "Failed to sign up with Google");
      setLoadingGoogle(false);
    }
  };

  const handleGithubSignIn = async () => {
    setLoadingGithub(true);
    const { error } = await signInWithGithub();
    if (error) {
      toast.error(error.message || "Failed to sign up with GitHub");
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
        background: "var(--bg-primary)",
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
          borderRadius: "24px",
          padding: "40px",
          border: "1px solid var(--border-light)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
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
            marginBottom: "32px",
            textDecoration: "none",
          }}
        >
          <div
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
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "26px",
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

        {/* OAuth Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          <button
            onClick={handleGoogleSignIn}
            disabled={isOAuthLoading || loading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "14px 20px",
              fontSize: "15px",
              fontWeight: 500,
              border: "1px solid var(--border-light)",
              borderRadius: "12px",
              cursor: isOAuthLoading || loading ? "not-allowed" : "pointer",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              opacity: isOAuthLoading || loading ? 0.7 : 1,
              transition: "all 0.2s ease",
            }}
          >
            {loadingGoogle ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            <span>Sign up with Google</span>
          </button>

          <button
            onClick={handleGithubSignIn}
            disabled={isOAuthLoading || loading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "14px 20px",
              fontSize: "15px",
              fontWeight: 500,
              border: "1px solid var(--border-light)",
              borderRadius: "12px",
              cursor: isOAuthLoading || loading ? "not-allowed" : "pointer",
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              opacity: isOAuthLoading || loading ? 0.7 : 1,
              transition: "all 0.2s ease",
            }}
          >
            {loadingGithub ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <GitHubIcon />
            )}
            <span>Sign up with GitHub</span>
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "var(--border-light)" }} />
          <span style={{ fontSize: "13px", color: "var(--text-tertiary)", fontWeight: 500 }}>
            or sign up with email
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-light)" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "var(--text-primary)",
              }}
            >
              Full Name
            </label>
            <div style={{ position: "relative" }}>
              <User
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-tertiary)",
                }}
              />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                style={{
                  width: "100%",
                  padding: "14px 14px 14px 44px",
                  fontSize: "15px",
                  border: "1px solid var(--border-light)",
                  borderRadius: "12px",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "var(--text-primary)",
              }}
            >
              Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-tertiary)",
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={{
                  width: "100%",
                  padding: "14px 14px 14px 44px",
                  fontSize: "15px",
                  border: "1px solid var(--border-light)",
                  borderRadius: "12px",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "var(--text-primary)",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-tertiary)",
                }}
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                minLength={6}
                style={{
                  width: "100%",
                  padding: "14px 48px 14px 44px",
                  fontSize: "15px",
                  border: "1px solid var(--border-light)",
                  borderRadius: "12px",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-tertiary)",
                  padding: "4px",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    marginBottom: "8px",
                  }}
                >
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      style={{
                        flex: 1,
                        height: "4px",
                        borderRadius: "2px",
                        background:
                          passwordStrength >= level
                            ? passwordStrength === 1
                              ? "#ef4444"
                              : passwordStrength === 2
                              ? "#f59e0b"
                              : "#22c55e"
                            : "var(--border-light)",
                        transition: "background 0.2s ease",
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {[
                    { check: passwordChecks.length, label: "6+ characters" },
                    { check: passwordChecks.hasLetter, label: "Has letter" },
                    { check: passwordChecks.hasNumber, label: "Has number" },
                  ].map(({ check, label }) => (
                    <span
                      key={label}
                      style={{
                        fontSize: "12px",
                        color: check ? "#22c55e" : "var(--text-tertiary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {check && <Check size={12} />}
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
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "var(--text-primary)",
              }}
            >
              Confirm Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-tertiary)",
                }}
              />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                style={{
                  width: "100%",
                  padding: "14px 14px 14px 44px",
                  fontSize: "15px",
                  border: `1px solid ${
                    confirmPassword && confirmPassword !== password
                      ? "#ef4444"
                      : "var(--border-light)"
                  }`,
                  borderRadius: "12px",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
              />
              {confirmPassword && confirmPassword === password && (
                <Check
                  size={18}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#22c55e",
                  }}
                />
              )}
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "6px" }}>
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
              borderRadius: "12px",
              cursor: loading || isOAuthLoading ? "not-allowed" : "pointer",
              opacity: loading || isOAuthLoading ? 0.7 : 1,
              transition: "all 0.2s ease",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight size={18} />
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
          <Link href="/terms" style={{ color: "var(--primary)", textDecoration: "none" }}>
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" style={{ color: "var(--primary)", textDecoration: "none" }}>
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

      {/* Spin animation */}
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
