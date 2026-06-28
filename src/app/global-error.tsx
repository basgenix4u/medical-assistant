"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App-level error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          textAlign: "center",
          gap: "16px",
          background: "#FDFBF9",
          color: "#1a1a1a",
        }}
      >
        <h1 style={{ fontSize: "24px", margin: 0 }}>Something went wrong</h1>
        <p style={{ color: "#6b6b6b", maxWidth: "400px" }}>
          An unexpected error occurred. Please try again.
        </p>
        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <button
            onClick={() => reset()}
            style={{
              padding: "12px 24px",
              background: "#452829",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            style={{
              padding: "12px 24px",
              border: "1px solid #d4d4d4",
              borderRadius: "12px",
              color: "#404040",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Go home
          </Link>
        </div>
      </body>
    </html>
  );
}
