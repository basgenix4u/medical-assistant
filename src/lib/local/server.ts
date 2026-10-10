// src/lib/local/server.ts
/**
 * Server-side backend client for API routes.
 *
 * Identifies the user from the httpOnly session cookie (gaps G1/G2/G4):
 * the session JWT is verified against its signature AND the sessions table,
 * so revoked sessions stop working immediately.
 */
import { runMigrations } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth/cookies";
import type { SessionUser } from "@/lib/auth/session";

let initialized = false;
async function ensureInit() {
  if (initialized) return;
  await runMigrations();
  initialized = true;
}

export type AuthedUser = SessionUser;

export async function createClient() {
  await ensureInit();
  return {
    auth: {
      getUser: async (): Promise<AuthedUser | null> => getSessionUser(),
    },
  };
}
