// src/lib/env.ts
/**
 * Validated environment configuration. SERVER-ONLY — never import from
 * client components (it reads process.env secrets).
 *
 * Production boots FAIL FAST when required secrets are missing or weak
 * (gap G3 in docs/ARCHITECTURE.md).
 */
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  AUTH_SECRET: z.string().min(1).optional(),
  GROQ_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1).optional(),
  DATABASE_AUTH_TOKEN: z.string().min(1).optional(),
  DATABASE_FILE: z.string().min(1).optional(),
  TRUST_PROXY: z.enum(["0", "1"]).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  MAIL_FROM: z.string().min(1).optional(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error(
    "[env] Invalid environment configuration:",
    JSON.stringify(parsed.error.flatten().fieldErrors)
  );
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";

const MIN_SECRET_LENGTH = 32;
const DEV_FALLBACK_SECRET = "dev-only-secret-change-me-in-production-please-please-please";

let authSecret = env.AUTH_SECRET;
if (!authSecret) {
  if (isProd) {
    throw new Error(
      "AUTH_SECRET is required in production. Generate one with: openssl rand -base64 32"
    );
  }
  console.warn("[env] AUTH_SECRET is not set — using an insecure development fallback.");
  authSecret = DEV_FALLBACK_SECRET;
}
if (authSecret.length < MIN_SECRET_LENGTH) {
  const msg = `AUTH_SECRET must be at least ${MIN_SECRET_LENGTH} characters.`;
  if (isProd) throw new Error(msg);
  console.warn(`[env] ${msg} The current secret is too short.`);
}

export const AUTH_SECRET = authSecret;

/** True when the deployment sits behind a trusted reverse proxy (Vercel, nginx, …). */
export const trustProxy = env.TRUST_PROXY === "1";

/** Throws when the Groq API key is missing — call at the point of use, not at import time. */
export function requireGroqApiKey(): string {
  const key = env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not configured");
  return key;
}
