import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/auth/login", "/auth/signup", "/terms", "/privacy"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/auth/callback",
          "/auth/reset-password",
          "/auth/forgot-password",
          "/offline",
        ],
      },
    ],
    sitemap: "https://medical-assistant-ashen.vercel.app/sitemap.xml",
  };
}
