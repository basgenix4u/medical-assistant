import { describe, it, expect } from "vitest";
import {
  validateQuery,
  isValidIdentifier,
  getTableGuard,
} from "@/lib/local/query-guard";

describe("query guard", () => {
  it("rejects unknown tables", () => {
    const r = validateQuery({
      table: "users; DROP TABLE users",
      mode: "select",
      filters: [],
      userId: "u1",
    });
    expect(r.ok).toBe(false);
  });

  it("rejects SQL injection via filter columns", () => {
    const r = validateQuery({
      table: "consultations",
      mode: "select",
      filters: [{ col: "id) OR 1=1 --", op: "eq", val: "x" }],
      userId: "u1",
    });
    expect(r.ok).toBe(false);
  });

  it("rejects SQL injection via order columns", () => {
    const r = validateQuery({
      table: "consultations",
      mode: "select",
      filters: [],
      orderBy: { col: "created_at; DROP TABLE users", ascending: false },
      userId: "u1",
    });
    expect(r.ok).toBe(false);
  });

  it("rejects writes to hidden columns (password_hash)", () => {
    const r = validateQuery({
      table: "profiles",
      mode: "update",
      filters: [],
      payload: { password_hash: "hacked" },
      userId: "u1",
    });
    expect(r.ok).toBe(false);
  });

  it("rejects changing the owner column", () => {
    const r = validateQuery({
      table: "consultations",
      mode: "update",
      filters: [],
      payload: { user_id: "someone-else" },
      userId: "u1",
    });
    expect(r.ok).toBe(false);
  });

  it("rejects disallowed modes on the users table", () => {
    expect(
      validateQuery({ table: "users", mode: "select", filters: [], userId: "u1" }).ok
    ).toBe(false);
    expect(
      validateQuery({ table: "users", mode: "delete", filters: [], userId: "u1" }).ok
    ).toBe(true);
  });

  it("allows a valid scoped select", () => {
    const r = validateQuery({
      table: "consultations",
      mode: "select",
      filters: [{ col: "id", op: "eq", val: "abc" }],
      orderBy: { col: "created_at", ascending: false },
      limit: 10,
      userId: "u1",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.guard.table).toBe("consultations");
      expect(r.filters).toHaveLength(1);
      expect(r.limit).toBe(10);
    }
  });

  it("maps the profiles alias to the users table", () => {
    const guard = getTableGuard("profiles");
    expect(guard?.table).toBe("users");
    expect(guard?.hiddenColumns).toContain("password_hash");
  });

  it("validates identifiers", () => {
    expect(isValidIdentifier("created_at")).toBe(true);
    expect(isValidIdentifier("user_id2")).toBe(true);
    expect(isValidIdentifier("1abc")).toBe(false);
    expect(isValidIdentifier("a b")).toBe(false);
    expect(isValidIdentifier("a-b")).toBe(false);
    expect(isValidIdentifier("")).toBe(false);
  });
});
