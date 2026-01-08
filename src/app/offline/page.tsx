// src/app/offline/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, Home } from "lucide-react";

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "var(--bg-primary)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "24px",
          background: "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "32px",
        }}
      >
        <WifiOff size={48} style={{ color: "var(--primary)" }} />
      </div>

      <h1
        style={{
          fontSize: "28px",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "12px",
        }}
      >
        You&apos;re Offline
      </h1>

      <p
        style={{
          fontSize: "16px",
          color: "var(--text-tertiary)",
          maxWidth: "400px",
          marginBottom: "32px",
          lineHeight: 1.6,
        }}
      >
        It looks like you&apos;ve lost your internet connection. Some features may not be available until you&apos;re back online.
      </p>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 24px",
            fontSize: "15px",
            fontWeight: 500,
            background: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={18} />
          Try Again
        </button>

        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 24px",
            fontSize: "15px",
            fontWeight: 500,
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-light)",
            borderRadius: "12px",
            textDecoration: "none",
          }}
        >
          <Home size={18} />
          Go Home
        </Link>
      </div>

      <div
        style={{
          marginTop: "48px",
          padding: "20px",
          background: "var(--bg-secondary)",
          borderRadius: "16px",
          border: "1px solid var(--border-light)",
          maxWidth: "400px",
        }}
      >
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}
        >
          Available Offline:
        </h3>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            textAlign: "left",
          }}
        >
          {[
            "View previously loaded pages",
            "Access cached remedies",
            "Review your history",
          ].map((item, i) => (
            <li
              key={i}
              style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
                padding: "8px 0",
                borderBottom: i < 2 ? "1px solid var(--border-light)" : "none",
              }}
            >
              ✓ {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}