// src/lib/local/server.ts
/**
 * Server-side local backend client. Used by API routes to read the
 * session cookie and identify the user. Mimics the parts of the
 * Supabase server client that our app actually uses.
 */
import { cookies } from "next/headers";
import type { InValue } from "@libsql/client";
import { verifySessionToken } from "@/lib/auth/jwt";
import { runMigrations } from "@/lib/db/schema";
import { getDb } from "@/lib/db/client";

const COOKIE_NAME = "medassist-session";

let initialized = false;
async function ensureInit() {
  if (initialized) return;
  await runMigrations();
  initialized = true;
}

export interface AuthedUser {
  id: string;
  email: string;
  full_name?: string;
}

export async function createClient() {
  await ensureInit();
  const cookieStore = await cookies();

  const getUser = async (): Promise<AuthedUser | null> => {
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = await verifySessionToken(token);
    if (!payload) return null;
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT id, email, full_name FROM users WHERE id = ?",
      args: [payload.sub],
    });
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id as string,
      email: row.email as string,
      full_name: (row.full_name as string) || undefined,
    };
  };

  const db = getDb();

  return {
    auth: { getUser },
    from: (table: string) => makeServerQuery(table, db, getUser),
  };
}

// Server-side query builder: simpler, synchronous-feeling.
function makeServerQuery(
  table: string,
  db: ReturnType<typeof getDb>,
  getUser: () => Promise<AuthedUser | null>
) {
  // Returns a "thenable" object that supports .eq().order().limit().single().maybeSingle()
  const state: {
    filters: Array<{ col: string; op: string; val: unknown }>;
    orderBy?: { col: string; ascending: boolean };
    limitN?: number;
    mode: "select" | "insert" | "update" | "delete" | "upsert";
    payload?: unknown;
    upsertOpts?: { onConflict?: string };
  } = { filters: [], mode: "select" };

  const builder: Record<string, unknown> = {};

  builder.select = function () {
    state.mode = "select";
    return builder;
  };
  builder.insert = function (payload: unknown) {
    state.mode = "insert";
    state.payload = payload;
    return builder;
  };
  builder.update = function (payload: unknown) {
    state.mode = "update";
    state.payload = payload;
    return builder;
  };
  builder.upsert = function (payload: unknown, opts?: { onConflict?: string }) {
    state.mode = "upsert";
    state.payload = payload;
    state.upsertOpts = opts;
    return builder;
  };
  builder.delete = function () {
    state.mode = "delete";
    return builder;
  };
  builder.eq = function (col: string, val: unknown) {
    state.filters.push({ col, op: "eq", val });
    return builder;
  };
  builder.order = function (col: string, opts?: { ascending?: boolean }) {
    state.orderBy = { col, ascending: opts?.ascending ?? true };
    return builder;
  };
  builder.limit = function (n: number) {
    state.limitN = n;
    return builder;
  };

  builder.single = async function () {
    const r = await execute();
    if (r.error) return { data: null, error: r.error };
    const arr = r.data as unknown[];
    return { data: arr[0] ?? null, error: null };
  };
  builder.maybeSingle = async function () {
    const r = await execute();
    if (r.error) return { data: null, error: r.error };
    const arr = r.data as unknown[];
    return { data: arr[0] ?? null, error: null };
  };

  builder.then = async function (onfulfilled: (v: { data: unknown; error: unknown }) => unknown) {
    const r = await execute();
    return onfulfilled(r);
  };

  async function execute(): Promise<{ data: unknown; error: { message: string } | null }> {
    const user = await getUser();
    if (!user) {
      return { data: null, error: { message: "Not authenticated" } };
    }
    return runServerQuery(db, table, state);
  }

  return builder;
}

async function runServerQuery(
  db: ReturnType<typeof getDb>,
  table: string,
  state: {
    filters: Array<{ col: string; op: string; val: unknown }>;
    orderBy?: { col: string; ascending: boolean };
    limitN?: number;
    mode: "select" | "insert" | "update" | "delete" | "upsert";
    payload?: unknown;
    upsertOpts?: { onConflict?: string };
  }
): Promise<{ data: unknown; error: { message: string } | null }> {
  try {
    if (state.mode === "select") {
      let sql = `SELECT * FROM ${table}`;
      const args: InValue[] = [];
      if (state.filters.length) {
        sql += " WHERE " + state.filters.map((f) => `${f.col} = ?`).join(" AND ");
        args.push(...(state.filters.map((f) => f.val) as InValue[]));
      }
      if (state.orderBy) {
        sql += ` ORDER BY ${state.orderBy.col} ${state.orderBy.ascending ? "ASC" : "DESC"}`;
      }
      if (state.limitN != null) sql += ` LIMIT ${state.limitN}`;
      const r = await db.execute({ sql, args });
      return { data: r.rows.map(parseRow), error: null };
    }
    if (state.mode === "insert") {
      const rows = Array.isArray(state.payload) ? state.payload : [state.payload];
      if (rows.length === 0) return { data: [], error: null };
      const cols = Object.keys(rows[0] as Record<string, unknown>);
      const placeholders = rows.map(() => `(${cols.map(() => "?").join(", ")})`).join(", ");
      const args: InValue[] = [];
      for (const row of rows) {
        for (const c of cols) args.push((row as Record<string, unknown>)[c] as InValue);
      }
      const sql = `INSERT INTO ${table} (${cols.join(", ")}) VALUES ${placeholders}`;
      try {
        const r = await db.execute({ sql, args });
        return { data: parseRow({ last_insert_rowid: r.lastInsertRowid }), error: null };
      } catch (e) {
        return { data: null, error: { message: e instanceof Error ? e.message : "Insert failed" } };
      }
    }
    if (state.mode === "update") {
      const payload = state.payload as Record<string, unknown>;
      const cols = Object.keys(payload);
      const sets = cols.map((c) => `${c} = ?`).join(", ");
      const args = cols.map((c) => payload[c]) as InValue[];
      let sql = `UPDATE ${table} SET ${sets}`;
      if (state.filters.length) {
        sql += " WHERE " + state.filters.map((f) => `${f.col} = ?`).join(" AND ");
        args.push(...(state.filters.map((f) => f.val) as InValue[]));
      }
      try {
        const r = await db.execute({ sql, args });
        return { data: { changes: r.rowsAffected }, error: null };
      } catch (e) {
        return { data: null, error: { message: e instanceof Error ? e.message : "Update failed" } };
      }
    }
    if (state.mode === "delete") {
      let sql = `DELETE FROM ${table}`;
      const args: InValue[] = [];
      if (state.filters.length) {
        sql += " WHERE " + state.filters.map((f) => `${f.col} = ?`).join(" AND ");
        args.push(...(state.filters.map((f) => f.val) as InValue[]));
      }
      try {
        await db.execute({ sql, args });
        return { data: null, error: null };
      } catch (e) {
        return { data: null, error: { message: e instanceof Error ? e.message : "Delete failed" } };
      }
    }
    if (state.mode === "upsert") {
      // SQLite has INSERT OR REPLACE / ON CONFLICT — simplified to INSERT OR REPLACE
      const rows = Array.isArray(state.payload) ? state.payload : [state.payload];
      const cols = Object.keys(rows[0] as Record<string, unknown>);
      const placeholders = cols.map(() => "?").join(", ");
      const args = cols.map((c) => (rows[0] as Record<string, unknown>)[c]) as InValue[];
      const sql = `INSERT OR REPLACE INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`;
      try {
        const r = await db.execute({ sql, args });
        return { data: parseRow({ last_insert_rowid: r.lastInsertRowid }), error: null };
      } catch (e) {
        return { data: null, error: { message: e instanceof Error ? e.message : "Upsert failed" } };
      }
    }
    return { data: null, error: { message: "Unknown mode" } };
  } catch (e) {
    return {
      data: null,
      error: { message: e instanceof Error ? e.message : "Query failed" },
    };
  }
}

function parseRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === "string") {
      // Try parse JSON strings
      if (
        (v.startsWith("[") && v.endsWith("]")) ||
        (v.startsWith("{") && v.endsWith("}"))
      ) {
        try {
          out[k] = JSON.parse(v);
          continue;
        } catch {
          /* fall through */
        }
      }
    }
    out[k] = v;
  }
  return out;
}
