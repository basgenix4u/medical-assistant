// src/lib/db/client.ts
/**
 * Database client. Uses libSQL (SQLite-compatible) which works:
 * - Locally: as a file at ./data/medassist.db
 * - On Vercel: in /tmp (ephemeral — fine for demos) OR via Turso cloud
 *
 * For production deployment with persistent data, set DATABASE_URL to a
 * Turso connection string. See docs/DEPLOYMENT.md for instructions.
 */
import { createClient, type Client } from "@libsql/client";

// Vercel's serverless filesystem is read-only except /tmp — fall back there
// so a no-config deployment still boots instead of crashing on first query.
const isVercel = !!process.env.VERCEL;
const filePath =
  process.env.DATABASE_FILE || (isVercel ? "/tmp/medassist.db" : "./data/medassist.db");

let _client: Client | null = null;
let _warned = false;

export function getDb(): Client {
  if (_client) return _client;
  if (process.env.DATABASE_URL) {
    // Turso or remote libSQL
    _client = createClient({
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
  } else {
    // Local SQLite file
    if (isVercel && !_warned) {
      _warned = true;
      console.warn(
        "[db] DATABASE_URL is not set on Vercel — using ephemeral /tmp storage. " +
          "Data will NOT persist across deployments or serverless cold starts. " +
          "Set DATABASE_URL to a Turso connection string for production."
      );
    }
    _client = createClient({ url: `file:${filePath}` });
  }
  return _client;
}

export type DbClient = ReturnType<typeof getDb>;
