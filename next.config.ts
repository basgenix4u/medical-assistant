import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Content Security Policy (gap G11). 'unsafe-eval' is only needed by the dev
// toolchain (Turbopack) — production drops it. No third-party origins.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.groq.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Referrer policy for privacy
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict powerful features
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Force HTTPS (when deployed behind HTTPS)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Content Security Policy
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  // Security: enforce type safety in builds
  typescript: {
    ignoreBuildErrors: false,
  },
  // Don't expose source maps in production
  productionBrowserSourceMaps: false,
  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // API routes get stricter cache-control
        source: "/api/:path*",
        headers: [
          ...securityHeaders,
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
  // Performance: compress responses
  compress: true,
  // Image optimization defaults
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
