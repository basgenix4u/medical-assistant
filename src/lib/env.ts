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

/**
 * `next build` (e.g. on Vercel) imports route modules to collect metadata,
 * which evaluates this module at BUILD time — before project env vars are
 * guaranteed to exist. Validation must therefore be strict at RUNTIME but
 * tolerant during the build phase, so a missing secret fails the deployed
 * app loudly at first request instead of breaking the build itself.
 */
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  const flat = JSON.stringify(parsed.error.flatten().fieldErrors);
  if (isBuildPhase) {
    console.warn(`[env] Invalid environment configuration during build (continuing): ${flat}`);
  } else {
    console.error("[env] Invalid environment configuration:", flat);
    throw new Error("Invalid environment configuration");
  }
}

type Env = z.infer<typeof EnvSchema>;

const fallbackEnv: Env = {
  NODE_ENV: (process.env.NODE_ENV as Env["NODE_ENV"]) || "development",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

export const env: Env = parsed.success ? parsed.data : fallbackEnv;
export const isProd = env.NODE_ENV === "production";

const MIN_SECRET_LENGTH = 32;
const DEV_FALLBACK_SECRET = "dev-only-secret-change-me-in-production-please-please-please";

let authSecret = env.AUTH_SECRET;
if (!authSecret) {
  if (isProd && !isBuildPhase) {
    throw new Error(
      "AUTH_SECRET is required in production. Generate one with: openssl rand -base64 32"
    );
  }
  console.warn(
    isBuildPhase
      ? "[env] AUTH_SECRET is not set — build will continue; set it in the deployment env."
      : "[env] AUTH_SECRET is not set — using an insecure development fallback."
  );
  authSecret = DEV_FALLBACK_SECRET;
}
if (authSecret.length < MIN_SECRET_LENGTH) {
  const msg = `AUTH_SECRET must be at least ${MIN_SECRET_LENGTH} characters.`;
  if (isProd && !isBuildPhase) throw new Error(msg);
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
