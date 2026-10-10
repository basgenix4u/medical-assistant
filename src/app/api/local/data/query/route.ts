// src/app/api/local/data/query/route.ts
/**
 * Generic per-user data endpoint — LOCKED DOWN (gap G5).
 *
 * All identifiers (table, columns, order) are validated by the query guard
 * against per-table whitelists before any SQL is built; every query is
 * force-scoped to the authenticated user; hidden columns (password_hash)
 * are never returned.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { InValue } from "@libsql/client";
import { randomUUID } from "crypto";
import { runMigrations } from "@/lib/db/schema";
import { getDb } from "@/lib/db/client";
import { getSessionUser } from "@/lib/auth/cookies";
import { validateQuery, type TableGuard } from "@/lib/local/query-guard";

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
  const user = await getSessionUser();
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
    return NextResponse.json({ error: { message: "Invalid query" } }, { status: 400 });
  }

  const validated = validateQuery({ ...parsed.data, userId: user.id });
  if (!validated.ok) {
    return NextResponse.json({ error: { message: validated.error } }, { status: 400 });
  }

  const { guard, mode, filters, orderBy, limit, payload } = validated;
  const db = getDb();
  // Every query is force-scoped to the authenticated user.
  const allFilters = [{ col: guard.ownerColumn, val: user.id }, ...filters];

  try {
    if (mode === "select") {
      const where = allFilters.map((f) => `"${f.col}" = ?`).join(" AND ");
      let sql = `SELECT * FROM "${guard.table}" WHERE ${where}`;
      const args = allFilters.map((f) => f.val as InValue);
      if (orderBy) {
        sql += ` ORDER BY "${orderBy.col}" ${orderBy.ascending ? "ASC" : "DESC"}`;
      }
      if (limit != null) sql += ` LIMIT ${limit}`;
      const r = await db.execute({ sql, args });
      return NextResponse.json({
        data: r.rows.map((row) =>
          parseRow(stripHidden(row as Record<string, unknown>, guard), guard)
        ),
      });
    }

    if (mode === "insert") {
      const rowsIn = Array.isArray(payload) ? payload : [payload];
      if (rowsIn.length === 0) return NextResponse.json({ data: [] });
      // Auto-inject owner column + primary key "id" so clients don't have to.
      const rows = rowsIn.map((r) => {
        const base = r as Record<string, unknown>;
        const next: Record<string, unknown> = { ...base };
        next[guard.ownerColumn] = user.id;
        if (!("id" in next) || next.id == null || next.id === "") {
          next.id = randomUUID();
        }
        return next;
      });
      const cols = Object.keys(rows[0] as Record<string, unknown>);
      const placeholders = rows
        .map(() => `(${cols.map(() => "?").join(", ")})`)
        .join(", ");
      const args: InValue[] = [];
      for (const row of rows) {
        for (const c of cols) {
          const v = (row as Record<string, unknown>)[c];
          args.push(serialize(v, guard.jsonColumns.includes(c)) as InValue);
        }
      }
      const colList = cols.map((c) => `"${c}"`).join(", ");
      const sql = `INSERT INTO "${guard.table}" (${colList}) VALUES ${placeholders}`;
      const r = await db.execute({ sql, args });
      return NextResponse.json({
        data: { inserted: rows.length, lastId: String(r.lastInsertRowid) },
      });
    }

    if (mode === "update") {
      const p = payload as Record<string, unknown>;
      const cols = Object.keys(p);
      const sets = cols.map((c) => `"${c}" = ?`).join(", ");
      const args = cols.map((c) => serialize(p[c], guard.jsonColumns.includes(c)));
      const where = allFilters.map((f) => `"${f.col}" = ?`).join(" AND ");
      const sql = `UPDATE "${guard.table}" SET ${sets} WHERE ${where}`;
      args.push(...(allFilters.map((f) => f.val as InValue)));
      const r = await db.execute({ sql, args: args as InValue[] });
      return NextResponse.json({ data: { updated: Number(r.rowsAffected) } });
    }

    if (mode === "delete") {
      const where = allFilters.map((f) => `"${f.col}" = ?`).join(" AND ");
      const args = allFilters.map((f) => f.val as InValue);
      const sql = `DELETE FROM "${guard.table}" WHERE ${where}`;
      await db.execute({ sql, args });
      return NextResponse.json({ data: null });
    }

    if (mode === "upsert") {
      const p = payload as Record<string, unknown>;
      // Force ownership on insert.
      p[guard.ownerColumn] = user.id;
      const cols = Object.keys(p);
      const placeholders = cols.map(() => "?").join(", ");
      const args = cols.map((c) => serialize(p[c], guard.jsonColumns.includes(c)));
      const colList = cols.map((c) => `"${c}"`).join(", ");
      const sql = `INSERT OR REPLACE INTO "${guard.table}" (${colList}) VALUES (${placeholders})`;
      const r = await db.execute({ sql, args: args as InValue[] });
      return NextResponse.json({
        data: { upserted: true, lastId: String(r.lastInsertRowid) },
      });
    }

    return NextResponse.json(
      { error: { message: "Unsupported mode" } },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: { message: "Query failed" } },
      { status: 500 }
    );
  }
}

/** Remove columns that must never reach the client (e.g. password_hash). */
function stripHidden(
  row: Record<string, unknown>,
  guard: TableGuard
): Record<string, unknown> {
  if (guard.hiddenColumns.length === 0) return row;
  const out = { ...row };
  for (const col of guard.hiddenColumns) delete out[col];
  return out;
}

function parseRow(
  row: Record<string, unknown>,
  guard: TableGuard
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === "string" && guard.jsonColumns.includes(k)) {
      try {
        out[k] = JSON.parse(v);
        continue;
      } catch {
        /* fall through */
      }
    }
    out[k] = v;
  }
  return out;
}

function serialize(v: unknown, asJson: boolean): unknown {
  if (asJson) {
    return JSON.stringify(v);
  }
  return v;
}
