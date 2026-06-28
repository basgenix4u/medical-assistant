"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Where to redirect unauthenticated users. Defaults to /auth/login. */
  redirectTo?: string;
}

/**
 * AuthGuard wraps protected client routes and redirects unauthenticated
 * visitors to the login page while preserving the original destination.
 */
export function AuthGuard({ children, redirectTo = "/auth/login" }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`${redirectTo}?next=${next}`);
    }
  }, [user, loading, router, pathname, redirectTo]);

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
        <p style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>
          Verifying your session…
        </p>
      </div>
    );
  }

  if (!user) {
    // Brief moment before redirect resolves; render nothing.
    return null;
  }

  return <>{children}</>;
}

export default AuthGuard;
