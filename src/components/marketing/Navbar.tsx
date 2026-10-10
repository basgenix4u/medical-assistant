// src/components/marketing/Navbar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { useAuth } from "@/lib/auth-context";

/** Expo-out easing curve (typed for framer-motion). */
const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#showcase", label: "How it works" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile drawer on Escape; move focus into it when opened.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className={`navbar${isScrolled ? " navbar-scrolled" : ""}`}>
        <div className="container">
          <nav
            aria-label="Main navigation"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "72px",
              gap: "16px",
            }}
          >
            <Logo />

            {/* Desktop nav */}
            <div className="hidden md:flex" style={{ alignItems: "center", gap: "8px" }}>
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="nav-link-premium">
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop auth actions */}
            <div className="hidden md:flex" style={{ alignItems: "center", gap: "12px" }}>
              {loading ? (
                <div style={{ width: "140px", height: "40px" }} aria-hidden="true" />
              ) : user ? (
                <Link href="/dashboard" className="btn-premium btn-premium-primary">
                  <LayoutDashboard size={16} aria-hidden="true" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="btn-premium btn-premium-outline">
                    Sign in
                  </Link>
                  <Link href="/auth/signup" className="btn-premium btn-premium-primary">
                    Get started free
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="btn-premium btn-premium-outline md:hidden"
              style={{ padding: "10px" }}
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X size={20} aria-hidden="true" />
              ) : (
                <Menu size={20} aria-hidden="true" />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              style={{ position: "absolute", inset: 0, backgroundColor: "rgba(20, 12, 12, 0.45)" }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                height: "100%",
                width: "min(320px, 86vw)",
                background: "var(--bg-tertiary)",
                borderLeft: "1px solid var(--glass-border)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                boxShadow: "var(--shadow-glow)",
              }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: EASE_OUT_EXPO }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
                <button
                  ref={closeButtonRef}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-premium btn-premium-outline"
                  style={{ padding: "10px" }}
                  aria-label="Close menu"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              <nav aria-label="Mobile navigation" style={{ flex: 1 }}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="nav-link-premium"
                        style={{ display: "block", padding: "14px 16px", fontSize: "16px" }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px" }}>
                {user ? (
                  <Link
                    href="/dashboard"
                    className="btn-premium btn-premium-primary btn-premium-lg"
                    style={{ width: "100%" }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} aria-hidden="true" />
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="btn-premium btn-premium-outline btn-premium-lg"
                      style={{ width: "100%" }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="btn-premium btn-premium-primary btn-premium-lg"
                      style={{ width: "100%" }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get started free
                      <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
