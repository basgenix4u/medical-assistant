// src/components/shared/ThemeToggle.tsx

"use client";

import { motion } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ThemeToggle({ showLabel = false, size = "md" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const sizes = {
    sm: { button: 32, icon: 16 },
    md: { button: 40, icon: 20 },
    lg: { button: 48, icon: 24 },
  };

  const config = sizes[size];

  const themes = [
    { id: "light" as const, icon: Sun, label: "Light" },
    { id: "dark" as const, icon: Moon, label: "Dark" },
    { id: "system" as const, icon: Monitor, label: "System" },
  ];

  if (showLabel) {
    // Full theme selector with labels
    return (
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "4px",
          background: "var(--bg-secondary)",
          borderRadius: "12px",
        }}
      >
        {themes.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTheme(id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              background: theme === id ? "var(--bg-tertiary)" : "transparent",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              color: theme === id ? "var(--text-primary)" : "var(--text-muted)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: theme === id ? "var(--shadow-sm)" : "none",
            }}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>
    );
  }

  // Simple toggle button
  return (
    <motion.button
      onClick={() => {
        // Cycle through themes
        if (theme === "light") setTheme("dark");
        else if (theme === "dark") setTheme("system");
        else setTheme("light");
      }}
      style={{
        width: config.button,
        height: config.button,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-light)",
        borderRadius: "10px",
        cursor: "pointer",
        color: "var(--text-secondary)",
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Current: ${theme} (${resolvedTheme})`}
    >
      <motion.div
        key={resolvedTheme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {resolvedTheme === "dark" ? (
          <Moon size={config.icon} />
        ) : (
          <Sun size={config.icon} />
        )}
      </motion.div>
    </motion.button>
  );
}