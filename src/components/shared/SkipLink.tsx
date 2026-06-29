"use client";

import { useRef } from "react";

export function SkipLink() {
  const ref = useRef<HTMLAnchorElement>(null);

  return (
    <a
      ref={ref}
      href="#main-content"
      style={{
        position: "absolute",
        left: "-9999px",
        top: "auto",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        zIndex: 9999,
      }}
      onFocus={() => {
        if (!ref.current) return;
        const el = ref.current;
        el.style.left = "16px";
        el.style.top = "16px";
        el.style.width = "auto";
        el.style.height = "auto";
        el.style.padding = "12px 24px";
        el.style.background = "var(--primary)";
        el.style.color = "white";
        el.style.borderRadius = "8px";
        el.style.fontWeight = "600";
      }}
      onBlur={() => {
        if (!ref.current) return;
        const el = ref.current;
        el.style.left = "-9999px";
        el.style.top = "auto";
        el.style.width = "1px";
        el.style.height = "1px";
        el.style.padding = "0";
        el.style.background = "transparent";
      }}
    >
      Skip to main content
    </a>
  );
}
