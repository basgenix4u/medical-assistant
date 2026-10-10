// src/lib/local/query-guard.ts
/**
 * Server-side authorization guard for the generic /api/local/data/query
 * endpoint (gap G5).
 *
 * Table and column names are interpolated into SQL by the query executor,
 * so EVERY identifier is validated here against per-table whitelists before
 * any SQL is built. Nothing from the client is ever interpolated raw.
 */

export const IDENTIFIER_PATTERN = /^[a-z_][a-z0-9_]{0,63}$/;

export type QueryMode = "select" | "insert" | "update" | "delete" | "upsert";

export interface TableGuard {
  /** Logical table name accepted from clients. */
  name: string;
  /** Physical table to query. */
  table: string;
  /** Column that must equal the authenticated user's id (forced server-side). */
  ownerColumn: string;
  /** Columns clients may reference (filters, ordering, payloads). */
  columns: ReadonlyArray<string>;
  /** Columns never returned to clients (e.g. password_hash). */
  hiddenColumns: ReadonlyArray<string>;
  /** Columns stored as JSON strings in the DB (parsed on read, stringified on write). */
  jsonColumns: ReadonlyArray<string>;
  /** Allowed operations (defaults to all). */
  allowedModes?: ReadonlyArray<QueryMode>;
}

export const TABLE_GUARDS: ReadonlyArray<TableGuard> = [
  {
    name: "profiles",
    table: "users",
    ownerColumn: "id",
    columns: [
      "id",
      "email",
      "full_name",
      "date_of_birth",
      "gender",
      "medical_conditions",
      "allergies",
      "created_at",
      "updated_at",
    ],
    hiddenColumns: ["password_hash"],
    jsonColumns: ["medical_conditions", "allergies"],
  },
  {
    name: "user_preferences",
    table: "user_preferences",
    ownerColumn: "user_id",
    columns: [
      "user_id",
      "theme",
      "email_notifications",
      "reminder_notifications",
      "preferred_remedy_types",
      "language",
      "updated_at",
    ],
    hiddenColumns: [],
    jsonColumns: ["preferred_remedy_types"],
  },
  {
    name: "consultations",
    table: "consultations",
    ownerColumn: "user_id",
    columns: [
      "id",
      "user_id",
      "symptoms",
      "symptoms_description",
      "duration",
      "severity_level",
      "ai_analysis",
      "ai_severity",
      "conditions_identified",
      "recommendations",
      "suggested_remedies",
      "warning_flags",
      "follow_up_recommended",
      "is_emergency",
      "created_at",
    ],
    hiddenColumns: [],
    jsonColumns: [
      "symptoms",
      "conditions_identified",
      "recommendations",
      "suggested_remedies",
      "warning_flags",
      "ai_analysis",
    ],
  },
  {
    name: "saved_remedies",
    table: "saved_remedies",
    ownerColumn: "user_id",
    columns: ["id", "user_id", "remedy_id", "notes", "created_at"],
    hiddenColumns: [],
    jsonColumns: [],
  },
  {
    name: "remedy_ratings",
    table: "remedy_ratings",
    ownerColumn: "user_id",
    columns: [
      "id",
      "user_id",
      "remedy_id",
      "rating",
      "effectiveness",
      "ease_of_use",
      "review_text",
      "would_recommend",
      "created_at",
    ],
    hiddenColumns: [],
    jsonColumns: [],
  },
  {
    name: "chat_messages",
    table: "chat_messages",
    ownerColumn: "user_id",
    columns: ["id", "user_id", "consultation_id", "role", "content", "created_at"],
    hiddenColumns: [],
    jsonColumns: [],
  },
  {
    // Direct access to the users table is delete-only (account deletion is
    // handled by a dedicated route with direct SQL; this entry is a safety net).
    name: "users",
    table: "users",
    ownerColumn: "id",
    columns: ["id"],
    hiddenColumns: ["password_hash"],
    jsonColumns: [],
    allowedModes: ["delete"],
  },
];

export function getTableGuard(name: string): TableGuard | null {
  return TABLE_GUARDS.find((g) => g.name === name) ?? null;
}

export function isValidIdentifier(value: string): boolean {
  return IDENTIFIER_PATTERN.test(value);
}

function isPrimitive(value: unknown): boolean {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

export type ValidatedQuery =
  | {
      ok: true;
      guard: TableGuard;
      mode: QueryMode;
      filters: Array<{ col: string; val: unknown }>;
      orderBy?: { col: string; ascending: boolean };
      limit?: number;
      payload?: unknown;
    }
  | { ok: false; error: string };

/**
 * Validates a client query spec against the whitelists and returns a
 * normalized, safe-to-execute spec (or an error message).
 */
export function validateQuery(input: {
  table: string;
  mode: QueryMode;
  filters?: Array<{ col: string; op: string; val?: unknown }>;
  orderBy?: { col: string; ascending: boolean };
  limit?: number;
  payload?: unknown;
  userId: string;
}): ValidatedQuery {
  const guard = getTableGuard(input.table);
  if (!guard) return { ok: false, error: `Unknown table: ${input.table}` };
  if (guard.allowedModes && !guard.allowedModes.includes(input.mode)) {
    return { ok: false, error: `Operation ${input.mode} not allowed on table ${input.table}` };
  }

  // Filters: eq only, whitelisted columns, primitive values.
  const filters: Array<{ col: string; val: unknown }> = [];
  for (const f of input.filters ?? []) {
    if (f.op !== "eq") return { ok: false, error: "Only eq filters are supported" };
    if (!isValidIdentifier(f.col) || !guard.columns.includes(f.col)) {
      return { ok: false, error: `Filter column not allowed: ${f.col}` };
    }
    if (!isPrimitive(f.val)) {
      return { ok: false, error: "Filter value must be a primitive" };
    }
    filters.push({ col: f.col, val: f.val });
  }

  // Ordering: whitelisted column only.
  let orderBy: { col: string; ascending: boolean } | undefined;
  if (input.orderBy) {
    if (!isValidIdentifier(input.orderBy.col) || !guard.columns.includes(input.orderBy.col)) {
      return { ok: false, error: `Order column not allowed: ${input.orderBy.col}` };
    }
    orderBy = { col: input.orderBy.col, ascending: input.orderBy.ascending };
  }

  // Limit: bounded integer (the route also enforces this via Zod).
  if (
    input.limit != null &&
    (!Number.isInteger(input.limit) || input.limit < 1 || input.limit > 500)
  ) {
    return { ok: false, error: "Limit must be an integer between 1 and 500" };
  }

  // Payloads: object(s) whose keys are all whitelisted columns.
  let payload: unknown;
  if (input.mode === "insert" || input.mode === "update" || input.mode === "upsert") {
    if (input.payload == null || typeof input.payload !== "object") {
      return { ok: false, error: "Payload must be an object" };
    }
    if (input.mode !== "insert" && Array.isArray(input.payload)) {
      return { ok: false, error: "Payload must be a single object" };
    }
    const rows = Array.isArray(input.payload) ? input.payload : [input.payload];
    if (rows.length === 0) return { ok: false, error: "Payload must not be empty" };
    for (const row of rows) {
      if (typeof row !== "object" || row === null || Array.isArray(row)) {
        return { ok: false, error: "Payload rows must be objects" };
      }
      for (const key of Object.keys(row as Record<string, unknown>)) {
        if (!isValidIdentifier(key)) return { ok: false, error: `Invalid column: ${key}` };
        if (!guard.columns.includes(key) && key !== guard.ownerColumn) {
          return { ok: false, error: `Column not allowed: ${key}` };
        }
        if (input.mode === "update" && key === guard.ownerColumn) {
          return { ok: false, error: "Cannot change the owner column" };
        }
        if (input.mode === "update" && key === "id") {
          return { ok: false, error: "Cannot change the primary key" };
        }
      }
    }
    payload = input.payload;
  } else if (input.payload !== undefined) {
    return { ok: false, error: "Payload not allowed for this operation" };
  }

  return {
    ok: true,
    guard,
    mode: input.mode,
    filters,
    orderBy,
    limit: input.limit,
    payload,
  };
}
