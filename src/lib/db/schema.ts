// src/lib/db/schema.ts
/**
 * Schema and migrations for the local backend.
 * Idempotent: safe to run on every server startup.
 *
 * IMPORTANT: libSQL (and SQLite clients in general) do NOT support multiple
 * statements in one .execute() call. We split each migration into separate
 * statements at module load time.
 */
import { getDb, type DbClient } from "./client";

type Migration = {
  id: string;
  statements?: ReadonlyArray<string>;
  /** Custom migration logic (used for conditional ALTER TABLE ... ADD COLUMN). */
  run?: (db: DbClient) => Promise<void>;
};

// Each statement is a single SQL command. Order matters (FKs need referenced tables first).
const MIGRATIONS: ReadonlyArray<Migration> = [
  {
    id: "0001_init",
    statements: [
      `CREATE TABLE IF NOT EXISTS users (
        id            TEXT PRIMARY KEY,
        email         TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name     TEXT,
        date_of_birth TEXT,
        gender        TEXT,
        created_at    TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS user_preferences (
        user_id                  TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        theme                    TEXT NOT NULL DEFAULT 'system',
        email_notifications      INTEGER NOT NULL DEFAULT 1,
        reminder_notifications   INTEGER NOT NULL DEFAULT 1,
        preferred_remedy_types   TEXT NOT NULL DEFAULT '[]',
        language                 TEXT NOT NULL DEFAULT 'en',
        updated_at               TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS sessions (
        token       TEXT PRIMARY KEY,
        user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at  TEXT NOT NULL,
        created_at  TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS consultations (
        id                     TEXT PRIMARY KEY,
        user_id                TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        symptoms               TEXT NOT NULL,
        symptoms_description   TEXT,
        duration               TEXT,
        severity_level         INTEGER,
        ai_analysis            TEXT,
        ai_severity            TEXT,
        conditions_identified  TEXT,
        recommendations        TEXT,
        suggested_remedies     TEXT,
        warning_flags          TEXT,
        follow_up_recommended  INTEGER DEFAULT 0,
        is_emergency           INTEGER DEFAULT 0,
        created_at             TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS saved_remedies (
        id           TEXT PRIMARY KEY,
        user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        remedy_id    TEXT NOT NULL,
        notes        TEXT,
        created_at   TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS remedy_ratings (
        id              TEXT PRIMARY KEY,
        user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        remedy_id       TEXT NOT NULL,
        rating          INTEGER NOT NULL,
        effectiveness   INTEGER,
        ease_of_use     INTEGER,
        review_text     TEXT,
        would_recommend INTEGER,
        created_at      TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(user_id, remedy_id)
      )`,
      `CREATE TABLE IF NOT EXISTS chat_messages (
        id              TEXT PRIMARY KEY,
        user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        consultation_id TEXT,
        role            TEXT NOT NULL,
        content         TEXT NOT NULL,
        created_at      TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE INDEX IF NOT EXISTS idx_consultations_user_created ON consultations (user_id, created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_saved_remedies_user ON saved_remedies (user_id, created_at DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages (user_id, created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id)`,
    ],
  },
  {
    // D1: server-side session revocation — sessions carry the JWT jti.
    id: "0002_sessions_jti",
    run: async (db) => {
      const cols = await db.execute("PRAGMA table_info(sessions)");
      const hasJti = cols.rows.some((r) => (r.name as string) === "jti");
      if (!hasJti) {
        await db.execute("ALTER TABLE sessions ADD COLUMN jti TEXT");
      }
      await db.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_jti ON sessions (jti)");
    },
  },
  {
    // D4: single-use password reset tokens (replaces replayable reset JWTs).
    id: "0003_password_resets",
    statements: [
      `CREATE TABLE IF NOT EXISTS password_resets (
        id          TEXT PRIMARY KEY,
        user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash  TEXT NOT NULL UNIQUE,
        expires_at  TEXT NOT NULL,
        used_at     TEXT,
        created_at  TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
      `CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets (user_id)`,
    ],
  },
  {
    // D3: additional indexes for aggregate/lookup queries.
    id: "0004_extra_indexes",
    statements: [
      `CREATE INDEX IF NOT EXISTS idx_remedy_ratings_remedy ON remedy_ratings (remedy_id)`,
      `CREATE INDEX IF NOT EXISTS idx_chat_messages_consultation ON chat_messages (consultation_id)`,
    ],
  },
  {
    // D7: health-profile columns on users (previously only on the legacy
    // Supabase `profiles` table) so profile conditions/allergies persist.
    id: "0005_users_health_profile",
    run: async (db) => {
      const cols = await db.execute("PRAGMA table_info(users)");
      const names = new Set(cols.rows.map((r) => r.name as string));
      if (!names.has("medical_conditions")) {
        await db.execute(
          "ALTER TABLE users ADD COLUMN medical_conditions TEXT NOT NULL DEFAULT '[]'"
        );
      }
      if (!names.has("allergies")) {
        await db.execute("ALTER TABLE users ADD COLUMN allergies TEXT NOT NULL DEFAULT '[]'");
      }
    },
  },
];

let migrated = false;

export async function runMigrations(): Promise<void> {
  if (migrated) return;
  const db = getDb();
  await db.execute("PRAGMA journal_mode = WAL;");
  await db.execute("PRAGMA foreign_keys = ON;");
  for (const m of MIGRATIONS) {
    try {
      if (m.run) {
        await m.run(db);
      }
      for (const sql of m.statements ?? []) {
        await db.execute(sql);
      }
    } catch (err) {
      console.error(`Migration ${m.id} failed:`, err);
      throw err;
    }
  }
  migrated = true;
}
