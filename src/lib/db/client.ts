// src/lib/db/client.ts
/**
 * Database client. Uses libSQL (SQLite-compatible) which works:
 * - Locally: as a file at ./data/medassist.db
 * - On Vercel: in /tmp (ephemeral — fine for demos) OR via Turso cloud
 *
 * For production deployment with persistent data, set DATABASE_URL to a
 * Turso connection string. See README for instructions.
 */
import { createClient, type Client } from "@libsql/client";

const isProd = process.env.NODE_ENV === "production";
const filePath = process.env.DATABASE_FILE || "./data/medassist.db";

let _client: Client | null = null;

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
    _client = createClient({ url: `file:${filePath}` });
  }
  return _client;
}

export type DbClient = ReturnType<typeof getDb>;
