// src/lib/auth/session.ts
/**
 * Server-side session management with DB-backed revocation (gap G4).
 *
 * A session = a signed JWT (containing a unique `jti`) + a row in the
 * `sessions` table. Every request verifies BOTH the JWT signature/expiry
 * AND the database row, so logout and password changes take effect
 * immediately — a stolen token dies with its session row.
 */
import { getDb } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/schema";
import {
  createSessionToken,
  verifySessionToken,
  SESSION_DURATION_SECONDS,
} from "@/lib/auth/jwt";

export interface SessionUser {
  id: string;
  email: string;
  full_name?: string;
}

export interface CreatedSession {
  token: string;
  jti: string;
  expiresAt: number; // unix seconds
}

/** SQLite-compatible UTC timestamp: 'YYYY-MM-DD HH:MM:SS' (comparable with datetime('now')). */
export function toSqliteUtc(date: Date): string {
  return date.toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
}

export async function createSession(userId: string, email: string): Promise<CreatedSession> {
  await runMigrations();
  const issued = await createSessionToken(userId, email);
  const db = getDb();
  // Opportunistic cleanup of expired sessions.
  await db.execute("DELETE FROM sessions WHERE expires_at < datetime('now')");
  await db.execute({
    sql: "INSERT INTO sessions (token, user_id, expires_at, jti) VALUES (?, ?, ?, ?)",
    args: [issued.jti, userId, toSqliteUtc(new Date(issued.expiresAt * 1000)), issued.jti],
  });
  return { token: issued.token, jti: issued.jti, expiresAt: issued.expiresAt };
}

/** Verify a session token against the JWT signature AND the sessions table. */
export async function verifySession(token: string): Promise<SessionUser | null> {
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  await runMigrations();
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT s.user_id AS user_id, s.expires_at AS expires_at, u.email AS email, u.full_name AS full_name
          FROM sessions s JOIN users u ON u.id = s.user_id
          WHERE s.jti = ?`,
    args: [payload.jti],
  });
  const row = result.rows[0];
  if (!row) return null;
  if (typeof row.expires_at === "string" && row.expires_at < toSqliteUtc(new Date())) {
    return null;
  }
  return {
    id: row.user_id as string,
    email: row.email as string,
    full_name: (row.full_name as string) || undefined,
  };
}

/** Revoke a single session by its jti (logout). */
export async function revokeSession(jti: string): Promise<void> {
  await runMigrations();
  const db = getDb();
  await db.execute({ sql: "DELETE FROM sessions WHERE jti = ?", args: [jti] });
}

/** Revoke all sessions for a user, optionally keeping one (e.g. the current session). */
export async function revokeAllSessionsForUser(userId: string, exceptJti?: string): Promise<void> {
  await runMigrations();
  const db = getDb();
  if (exceptJti) {
    await db.execute({
      sql: "DELETE FROM sessions WHERE user_id = ? AND jti != ?",
      args: [userId, exceptJti],
    });
  } else {
    await db.execute({ sql: "DELETE FROM sessions WHERE user_id = ?", args: [userId] });
  }
}

export { SESSION_DURATION_SECONDS };
