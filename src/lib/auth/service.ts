// src/lib/auth/service.ts
/**
 * Authentication business logic — framework-agnostic and unit-testable.
 * Route handlers are thin adapters over these functions (Clean Architecture).
 */
import { randomBytes, randomUUID, createHash } from "crypto";
import { getDb } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/schema";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from "@/lib/auth/password";
import {
  createSession,
  revokeSession,
  revokeAllSessionsForUser,
  toSqliteUtc,
  type CreatedSession,
  type SessionUser,
} from "@/lib/auth/session";
import { verifySessionToken } from "@/lib/auth/jwt";
import { env, isProd } from "@/lib/env";
import { getMailer } from "@/lib/mail";
import { log } from "@/lib/logging";

export interface AuthError {
  message: string;
  status: number;
}

export type AuthResult<T> =
  | { data: T; error: null }
  | { data: null; error: AuthError };

const RESET_TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour

function err(message: string, status: number): AuthError {
  return { message, status };
}
function ok<T>(data: T): AuthResult<T> {
  return { data, error: null };
}
function fail<T>(error: AuthError): AuthResult<T> {
  return { data: null, error };
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export async function signupUser(input: {
  email: string;
  password: string;
  full_name?: string;
}): Promise<AuthResult<{ user: SessionUser; session: CreatedSession }>> {
  await runMigrations();
  const email = normalizeEmail(input.email);
  const strength = validatePasswordStrength(input.password);
  if (!strength.ok) {
    return fail(err(`Weak password: ${strength.errors.join(", ")}`, 400));
  }
  const db = getDb();
  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: [email],
  });
  if (existing.rows.length > 0) {
    return fail(err("An account with this email already exists.", 409));
  }
  const id = randomUUID();
  const passwordHash = await hashPassword(input.password);
  const fullName = input.full_name?.trim() || null;
  await db.execute({
    sql: "INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)",
    args: [id, email, passwordHash, fullName],
  });
  await db.execute({ sql: "INSERT INTO user_preferences (user_id) VALUES (?)", args: [id] });
  const session = await createSession(id, email);
  const user: SessionUser = { id, email, full_name: fullName ?? undefined };
  return ok({ user, session });
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<AuthResult<{ user: SessionUser; session: CreatedSession }>> {
  await runMigrations();
  const email = normalizeEmail(input.email);
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT id, email, password_hash, full_name FROM users WHERE email = ?",
    args: [email],
  });
  const row = result.rows[0];
  // Identical error for unknown user and wrong password (no account enumeration).
  if (!row) return fail(err("Invalid email or password.", 401));
  const valid = await verifyPassword(input.password, row.password_hash as string);
  if (!valid) return fail(err("Invalid email or password.", 401));
  const session = await createSession(row.id as string, row.email as string);
  const user: SessionUser = {
    id: row.id as string,
    email: row.email as string,
    full_name: (row.full_name as string) || undefined,
  };
  return ok({ user, session });
}

/** Logout: revokes the session server-side (gap G4). */
export async function logoutWithToken(token: string): Promise<void> {
  const payload = await verifySessionToken(token);
  if (!payload) return;
  await revokeSession(payload.jti);
}

export async function getUserById(userId: string): Promise<SessionUser | null> {
  await runMigrations();
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT id, email, full_name FROM users WHERE id = ?",
    args: [userId],
  });
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id as string,
    email: row.email as string,
    full_name: (row.full_name as string) || undefined,
  };
}

/**
 * Change password for a signed-in user. Requires the current password,
 * verified server-side (prevents session-hijack → password-lockout).
 * Revokes every other session; keeps `keepJti` (the current session) alive.
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
  keepJti?: string
): Promise<AuthResult<null>> {
  await runMigrations();
  const strength = validatePasswordStrength(newPassword);
  if (!strength.ok) {
    return fail(err(`Weak password: ${strength.errors.join(", ")}`, 400));
  }
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT password_hash FROM users WHERE id = ?",
    args: [userId],
  });
  const row = result.rows[0];
  if (!row) return fail(err("User not found.", 404));
  const valid = await verifyPassword(currentPassword, row.password_hash as string);
  if (!valid) return fail(err("Current password is incorrect.", 403));
  const passwordHash = await hashPassword(newPassword);
  await db.execute({
    sql: "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?",
    args: [passwordHash, userId],
  });
  await revokeAllSessionsForUser(userId, keepJti);
  return ok(null);
}

/**
 * Request a password reset. Always succeeds (no account enumeration).
 * Creates a single-use, time-boxed token (gap G15) and emails the link
 * via the configured mailer (gap G14).
 */
export async function requestPasswordReset(email: string): Promise<{ resetUrl?: string }> {
  await runMigrations();
  const db = getDb();
  const normalized = normalizeEmail(email);
  const result = await db.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: [normalized],
  });
  if (result.rows.length === 0) {
    // Do not reveal whether the account exists.
    return {};
  }
  const userId = result.rows[0].id as string;
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = toSqliteUtc(new Date(Date.now() + RESET_TOKEN_TTL_MS));
  await db.execute({
    sql: "INSERT INTO password_resets (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
    args: [randomUUID(), userId, tokenHash, expiresAt],
  });
  const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${rawToken}`;
  try {
    await getMailer().sendPasswordReset(normalized, resetUrl);
  } catch (e) {
    log.error({
      msg: "password reset email failed",
      error: e instanceof Error ? e.message : String(e),
    });
  }
  // In development (console mailer), surface the URL so the flow stays testable.
  return isProd ? {} : { resetUrl };
}

/** Reset password with a single-use token (gap G15). Revokes all sessions. */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<AuthResult<null>> {
  await runMigrations();
  const strength = validatePasswordStrength(newPassword);
  if (!strength.ok) {
    return fail(err(`Weak password: ${strength.errors.join(", ")}`, 400));
  }
  const db = getDb();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const result = await db.execute({
    sql: "SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token_hash = ?",
    args: [tokenHash],
  });
  const row = result.rows[0];
  if (!row) return fail(err("Invalid or expired reset link.", 400));
  if (row.used_at) return fail(err("This reset link has already been used.", 400));
  if (typeof row.expires_at === "string" && row.expires_at < toSqliteUtc(new Date())) {
    return fail(err("Invalid or expired reset link.", 400));
  }
  const userId = row.user_id as string;
  const passwordHash = await hashPassword(newPassword);
  await db.execute({
    sql: "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?",
    args: [passwordHash, userId],
  });
  // Single-use: mark consumed, then revoke every session.
  await db.execute({
    sql: "UPDATE password_resets SET used_at = datetime('now') WHERE id = ?",
    args: [row.id as string],
  });
  await revokeAllSessionsForUser(userId);
  return ok(null);
}
