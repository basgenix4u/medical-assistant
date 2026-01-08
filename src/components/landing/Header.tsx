// src/components/landing/Header.tsx

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X, ArrowRight, User } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#testimonials", label: "Testimonials" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`header ${isScrolled ? "header-scrolled" : ""}`}>
        <div className="container">
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "72px",
            }}
          >
            <Logo />

            {/* Desktop Nav */}
            <div
              className="hidden md:flex"
              style={{ alignItems: "center", gap: "32px" }}
            >
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="nav-link">
                  {link.label}
                </a>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex" style={{ alignItems: "center", gap: "12px" }}>
              {loading ? (
                <div style={{ width: "120px" }} />
              ) : user ? (
                <Link
                  href="/dashboard"
                  className="btn btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <User size={16} />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="btn btn-ghost"
                  >
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="btn btn-primary">
                    Get Started
                    <ArrowRight size={16} />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="btn btn-ghost btn-icon md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                height: "100%",
                width: "280px",
                backgroundColor: "var(--bg-tertiary)",
                borderLeft: "1px solid var(--border-light)",
                padding: "24px",
              }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn btn-ghost btn-icon"
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      padding: "12px 16px",
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                      borderRadius: "8px",
                      textDecoration: "none",
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {user ? (
                  <Link
                    href="/dashboard"
                    className="btn btn-primary btn-lg"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User size={18} />
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="btn btn-secondary btn-lg"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="btn btn-primary btn-lg"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
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