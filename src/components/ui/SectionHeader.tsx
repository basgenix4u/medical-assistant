// src/components/ui/SectionHeader.tsx
import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
}

/** Premium section header: eyebrow pill + display title + supporting copy. */
export function SectionHeader({ eyebrow, title, description, align = "center" }: SectionHeaderProps) {
  return (
    <div className={`section-header-premium${align === "left" ? " section-header-left" : ""}`}>
      <span className="eyebrow">
        <span className="eyebrow-dot" aria-hidden="true" />
        {eyebrow}
      </span>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
