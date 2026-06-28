// src/app/layout.tsx

import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth-context";
import { ProfileProvider } from "@/lib/profile-context";
import { ThemeProvider } from "@/lib/theme-context";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MedAssist - Your Intelligent Medical Assistant",
    template: "%s | MedAssist",
  },
  description:
    "AI-powered symptom analysis and natural remedy recommendations. For informational purposes only — not a substitute for professional medical advice.",
  applicationName: "MedAssist",
  keywords: [
    "medical assistant",
    "symptom checker",
    "natural remedies",
    "AI health",
    "wellness",
  ],
  authors: [{ name: "Abdulbasit Abdulalim" }],
  creator: "Abdulbasit Abdulalim",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MedAssist",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "MedAssist",
    title: "MedAssist - Your Intelligent Medical Assistant",
    description:
      "AI-powered symptom analysis and natural remedy recommendations. Informational only.",
    locale: "en_US",
    url: "https://medical-assistant-ashen.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "MedAssist - Your Intelligent Medical Assistant",
    description:
      "AI-powered symptom analysis and natural remedy recommendations.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#452829" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1614" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MedAssist" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#452829" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body suppressHydrationWarning>
        <a
          href="#main-content"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "auto",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
          onFocus={(e) => {
            const el = e.currentTarget;
            el.style.left = "16px";
            el.style.top = "16px";
            el.style.width = "auto";
            el.style.height = "auto";
            el.style.padding = "12px 24px";
            el.style.background = "var(--primary)";
            el.style.color = "white";
            el.style.borderRadius = "8px";
            el.style.zIndex = "9999";
            el.style.fontWeight = "600";
          }}
          onBlur={(e) => {
            const el = e.currentTarget;
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
        <ThemeProvider>
          <AuthProvider>
            <ProfileProvider>
              {children}
              <InstallPrompt />
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "var(--bg-tertiary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "12px",
                  },
                  success: {
                    iconTheme: {
                      primary: "#22c55e",
                      secondary: "white",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#ef4444",
                      secondary: "white",
                    },
                  },
                }}
              />
            </ProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
