// src/lib/logging.ts
/**
 * Structured, redaction-aware logger (gap G13 in docs/ARCHITECTURE.md).
 * Emits single-line JSON. Secrets, tokens, and sensitive fields are
 * redacted before anything reaches the output — PII/secrets are never logged.
 */

type LogLevel = "debug" | "info" | "warn" | "error";
type LogFields = Record<string, unknown>;

const SENSITIVE_KEYS = new Set([
  "password",
  "password_hash",
  "current_password",
  "currentpassword",
  "new_password",
  "newpassword",
  "token",
  "access_token",
  "id_token",
  "refresh_token",
  "authorization",
  "cookie",
  "set-cookie",
  "secret",
  "api_key",
  "apikey",
  "auth_secret",
  "reset_token",
  "session",
  "session_token",
  "medassist-session",
]);

const REDACTED = "[REDACTED]";

function redactValue(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === "string") {
    if (/^Bearer\s+/i.test(value)) return REDACTED;
    // JWT-shaped strings
    if (/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) return REDACTED;
    return value;
  }
  if (Array.isArray(value)) return value.map(redactValue);
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEYS.has(k.toLowerCase()) ? REDACTED : redactValue(v);
    }
    return out;
  }
  return value;
}

function write(level: LogLevel, fields: LogFields): void {
  const entry = {
    level,
    time: new Date().toISOString(),
    ...(redactValue(fields) as Record<string, unknown>),
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  debug: (fields: LogFields): void => write("debug", fields),
  info: (fields: LogFields): void => write("info", fields),
  warn: (fields: LogFields): void => write("warn", fields),
  error: (fields: LogFields): void => write("error", fields),
};

/** Returns the incoming x-request-id header value, or generates a fresh one. */
export function getRequestId(request?: Request): string {
  const incoming = request?.headers.get("x-request-id");
  if (incoming && /^[A-Za-z0-9-]{1,64}$/.test(incoming)) return incoming;
  return crypto.randomUUID();
}
