import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { runMigrations } from "@/lib/db/schema";
import { getDb } from "@/lib/db/client";
import { verifySessionToken } from "@/lib/auth/jwt";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";

const COOKIE_NAME = "medassist-session";

const Schema = z.object({
  password: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  await runMigrations();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid JSON" } }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: "Invalid input" } }, { status: 400 });
  }
  const strength = validatePasswordStrength(parsed.data.password);
  if (!strength.ok) {
    return NextResponse.json(
      { error: { message: `Weak password: ${strength.errors.join(", ")}` } },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated" } }, { status: 401 });
  }
  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: { message: "Invalid session" } }, { status: 401 });
  }

  const db = getDb();
  const passwordHash = await hashPassword(parsed.data.password);
  await db.execute({
    sql: "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?",
    args: [passwordHash, session.sub],
  });

  return NextResponse.json({ ok: true });
}
