// src/app/api/local/data/query/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { InValue } from "@libsql/client";
import { runMigrations } from "@/lib/db/schema";
import { getDb } from "@/lib/db/client";
import { createClient } from "@/lib/local/server";

// Whitelist of tables that can be queried, plus allowed columns and
// per-table RLS rules. This is our application-level authorization layer.
const ALLOWED_TABLES: Record<
  string,
  {
    ownerColumn: string; // column that must equal authed user id
    jsonColumns: string[]; // columns stored as JSON-string in DB
    actualTable?: string; // if set, rewrite the query to use this table
    allowedModes?: ReadonlyArray<"select" | "insert" | "update" | "delete" | "upsert">;
  }
> = {
  profiles: {
    ownerColumn: "id",
    jsonColumns: ["medical_conditions", "allergies"],
    actualTable: "users",
  },
  users: {
    ownerColumn: "id",
    jsonColumns: [],
    allowedModes: ["delete"],
  },
  user_preferences: {
    ownerColumn: "user_id",
    jsonColumns: ["preferred_remedy_types"],
  },
  consultations: {
    ownerColumn: "user_id",
    jsonColumns: [
      "symptoms",
      "conditions_identified",
      "recommendations",
      "suggested_remedies",
      "warning_flags",
      "ai_analysis",
    ],
  },
  saved_remedies: { ownerColumn: "user_id", jsonColumns: [] },
  remedy_ratings: { ownerColumn: "user_id", jsonColumns: [] },
  chat_messages: { ownerColumn: "user_id", jsonColumns: [] },
};

const FilterSchema = z.object({
  col: z.string().min(1).max(64),
  op: z.literal("eq"),
  val: z.unknown(),
});

const QuerySchema = z.object({
  table: z.string().min(1).max(64),
  mode: z.enum(["select", "insert", "update", "delete", "upsert"]),
  filters: z.array(FilterSchema).max(20).default([]),
  orderBy: z
    .object({ col: z.string().max(64), ascending: z.boolean() })
    .optional(),
  limit: z.number().int().min(1).max(500).optional(),
  select: z.string().max(200).optional(),
  payload: z.unknown().optional(),
  onConflict: z.string().max(64).optional(),
});

export async function POST(request: NextRequest) {
  await runMigrations();
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { message: "Not authenticated" } },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid JSON" } }, { status: 400 });
  }
  const parsed = QuerySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Invalid query" } },
      { status: 400 }
    );
  }

  const { table, mode, filters, orderBy, limit, payload } = parsed.data;
  const cfg = ALLOWED_TABLES[table];
  if (cfg.allowedModes && !cfg.allowedModes.includes(mode)) {
    return NextResponse.json(
      { error: { message: `Operation ${mode} not allowed on table ${table}` } },
      { status: 400 }
    );
  }
  if (!cfg) {
    return NextResponse.json(
      { error: { message: `Unknown table: ${table}` } },
      { status: 400 }
    );
  }

  const actualTable = cfg.actualTable || table;
  const db = getDb();

  try {
    if (mode === "select") {
      // Force user-scope filter unless payload explicitly requests otherwise.
      const allFilters = [
        { col: cfg.ownerColumn, op: "eq" as const, val: user.id },
        ...filters,
      ];
      let sql = `SELECT * FROM ${actualTable}`;
      const args: InValue[] = [];
      const where = allFilters.map((f) => `${f.col} = ?`).join(" AND ");
      if (where) sql += ` WHERE ${where}`;
      args.push(...(allFilters.map((f) => f.val) as InValue[]));
      if (orderBy) sql += ` ORDER BY ${orderBy.col} ${orderBy.ascending ? "ASC" : "DESC"}`;
      if (limit != null) sql += ` LIMIT ${limit}`;
      const r = await db.execute({ sql, args: args as InValue[] });
      return NextResponse.json({
        data: r.rows.map((row) =>
          parseRow(row as Record<string, unknown>, cfg.jsonColumns)
        ),
      });
    }

    if (mode === "insert") {
      const rows = Array.isArray(payload) ? payload : [payload];
      if (rows.length === 0) return NextResponse.json({ data: [] });
      const cols = Object.keys(rows[0] as Record<string, unknown>);
      const placeholders = rows
        .map(() => `(${cols.map(() => "?").join(", ")})`)
        .join(", ");
      const args: InValue[] = [];
      for (const row of rows) {
        for (const c of cols) {
          const v = (row as Record<string, unknown>)[c];
          args.push(serialize(v, cfg.jsonColumns.includes(c)) as InValue);
        }
      }
      const sql = `INSERT INTO ${actualTable} (${cols.join(", ")}) VALUES ${placeholders}`;
      const r = await db.execute({ sql, args: args as InValue[] });
      return NextResponse.json({ data: { inserted: rows.length, lastId: r.lastInsertRowid } });
    }

    if (mode === "update") {
      const p = payload as Record<string, unknown>;
      const cols = Object.keys(p);
      const sets = cols.map((c) => `${c} = ?`).join(", ");
      const args = cols.map((c) =>
        serialize(p[c], cfg.jsonColumns.includes(c))
      );
      const allFilters = [
        { col: cfg.ownerColumn, op: "eq" as const, val: user.id },
        ...filters,
      ];
      const where = allFilters.map((f) => `${f.col} = ?`).join(" AND ");
      const sql = `UPDATE ${actualTable} SET ${sets} WHERE ${where}`;
      args.push(...(allFilters.map((f) => f.val) as InValue[]));
      const r = await db.execute({ sql, args: args as InValue[] });
      return NextResponse.json({ data: { updated: r.rowsAffected } });
    }

    if (mode === "delete") {
      const allFilters = [
        { col: cfg.ownerColumn, op: "eq" as const, val: user.id },
        ...filters,
      ];
      const where = allFilters.map((f) => `${f.col} = ?`).join(" AND ");
      const args = allFilters.map((f) => f.val) as InValue[];
      const sql = `DELETE FROM ${actualTable} WHERE ${where}`;
      await db.execute({ sql, args });
      return NextResponse.json({ data: null });
    }

    if (mode === "upsert") {
      const p = payload as Record<string, unknown>;
      // Force ownership column on insert
      p[cfg.ownerColumn] = user.id;
      const cols = Object.keys(p);
      const placeholders = cols.map(() => "?").join(", ");
      const args = cols.map((c) => serialize(p[c], cfg.jsonColumns.includes(c)));
      const sql = `INSERT OR REPLACE INTO ${actualTable} (${cols.join(", ")}) VALUES (${placeholders})`;
      const r = await db.execute({ sql, args: args as InValue[] });
      return NextResponse.json({ data: { upserted: true, lastId: r.lastInsertRowid } });
    }

    return NextResponse.json({ error: { message: "Unsupported mode" } }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: { message: e instanceof Error ? e.message : "Query failed" } },
      { status: 500 }
    );
  }
}

function parseRow(row: Record<string, unknown>, jsonCols: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === "string" && jsonCols.includes(k)) {
      try {
        out[k] = JSON.parse(v);
      } catch {
        out[k] = v;
      }
    } else {
      out[k] = v;
    }
  }
  return out;
}

function serialize(v: unknown, asJson: boolean): unknown {
  if (asJson) {
    return JSON.stringify(v);
  }
  return v;
}
