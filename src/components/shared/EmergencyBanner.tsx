"use client";

import { Phone, Siren } from "lucide-react";

interface EmergencyBannerProps {
  message?: string;
}

/**
 * Prominent emergency banner shown whenever an analysis or chat response
 * indicates a potential medical emergency. Surfaces local emergency
 * numbers so the user can act immediately.
 */
export function EmergencyBanner({ message }: EmergencyBannerProps) {
  const defaultMessage =
    "Based on what you described, this may be a medical emergency. " +
    "Please contact your local emergency services immediately.";

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
        color: "white",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 10px 30px rgba(220, 38, 38, 0.3)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          aria-hidden="true"
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Siren size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
            Possible Medical Emergency
          </h2>
          <p style={{ fontSize: "14px", margin: "4px 0 0 0", opacity: 0.95 }}>
            {message || defaultMessage}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        <a
          href="tel:911"
          style={{
            background: "white",
            color: "#991b1b",
            padding: "16px 20px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: "15px",
          }}
        >
          <span>
            <Phone size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} />
            Call 911 (US/CA)
          </span>
        </a>
        <a
          href="tel:999"
          style={{
            background: "white",
            color: "#991b1b",
            padding: "16px 20px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: "15px",
          }}
        >
          <span>
            <Phone size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} />
            Call 999 (UK)
          </span>
        </a>
        <a
          href="tel:112"
          style={{
            background: "white",
            color: "#991b1b",
            padding: "16px 20px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: "15px",
          }}
        >
          <span>
            <Phone size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} />
            Call 112 (EU)
          </span>
        </a>
      </div>

      <p style={{ fontSize: "12px", opacity: 0.85, margin: 0 }}>
        This tool provides general information only and cannot diagnose
        emergencies. If in doubt, contact your local emergency number or
        go to the nearest emergency room.
      </p>
    </div>
  );
}

export default EmergencyBanner;
