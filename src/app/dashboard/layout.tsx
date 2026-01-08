// src/app/dashboard/layout.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Search,
  BookOpen,
  History,
  Bookmark,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/analyze", icon: Search, label: "Analyze Symptoms" },
  { href: "/dashboard/chat", icon: MessageSquare, label: "AI Chat" },
  { href: "/dashboard/remedies", icon: BookOpen, label: "Remedies" },
  { href: "/dashboard/history", icon: History, label: "History" },
  { href: "/dashboard/saved", icon: Bookmark, label: "Saved" },
];

const bottomNavItems = [
  { href: "/dashboard/profile", icon: User, label: "Profile" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive check on client only
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || "User";
  const displayEmail = profile?.email || user?.email || "";
  const displayInitial = displayName.charAt(0).toUpperCase() || "U";

  // Sidebar styles
  const sidebarStyle: React.CSSProperties = {
    width: "260px",
    background: "var(--bg-tertiary)",
    borderRight: "1px solid var(--border-light)",
    padding: "24px 16px",
    display: isMobile ? "none" : "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    zIndex: 50,
  };

  // Mobile header styles
  const mobileHeaderStyle: React.CSSProperties = {
    display: isMobile ? "flex" : "none",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "64px",
    background: "var(--bg-tertiary)",
    borderBottom: "1px solid var(--border-light)",
    padding: "0 16px",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 50,
  };

  // Main content styles
  const mainStyle: React.CSSProperties = {
    flex: 1,
    marginLeft: isMobile ? 0 : "260px",
    padding: "24px",
    paddingTop: isMobile ? "88px" : "24px",
    minHeight: "100vh",
  };

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "12px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 500,
    transition: "all 0.2s ease",
    background: active ? "var(--primary)" : "transparent",
    color: active ? "white" : "var(--text-secondary)",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-secondary)" }}>
      {/* Desktop Sidebar */}
      <aside style={sidebarStyle}>
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "32px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "var(--primary)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: "18px",
            }}
          >
            M
          </div>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--primary)" }}>
            MedAssist
          </span>
        </Link>

        {/* Main Navigation */}
        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {navItems.map((item) => (
              <li key={item.href} style={{ marginBottom: "4px" }}>
                <Link href={item.href} style={navLinkStyle(isActive(item.href))}>
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "16px" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px 0" }}>
            {bottomNavItems.map((item) => (
              <li key={item.href} style={{ marginBottom: "4px" }}>
                <Link href={item.href} style={navLinkStyle(isActive(item.href))}>
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* User Info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              background: "var(--bg-secondary)",
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "var(--primary)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {displayInitial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {displayName}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-tertiary)",
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {displayEmail}
              </p>
            </div>
            <button
              onClick={signOut}
              title="Sign Out"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "8px",
                color: "var(--text-tertiary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header style={mobileHeaderStyle}>
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "var(--primary)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            M
          </div>
          <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--primary)" }}>
            MedAssist
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            color: "var(--text-primary)",
          }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 100,
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "280px",
              height: "100%",
              background: "var(--bg-tertiary)",
              padding: "24px 16px",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "32px",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "var(--primary)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "18px",
                }}
              >
                M
              </div>
              <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--primary)" }}>
                MedAssist
              </span>
            </Link>

            <nav style={{ flex: 1 }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[...navItems, ...bottomNavItems].map((item) => (
                  <li key={item.href} style={{ marginBottom: "4px" }}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      style={navLinkStyle(isActive(item.href))}
                    >
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                background: "var(--bg-secondary)",
                borderRadius: "12px",
                marginTop: "16px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "var(--primary)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                {displayInitial}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "14px", fontWeight: 500, margin: 0 }}>{displayName}</p>
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: 0 }}>
                  {displayEmail}
                </p>
              </div>
              <button
                onClick={signOut}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  color: "var(--text-tertiary)",
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={mainStyle}>{children}</main>
    </div>
  );
}