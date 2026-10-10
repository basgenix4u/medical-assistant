import { NextResponse } from "next/server";
import { runMigrations } from "@/lib/db/schema";
import { getDb } from "@/lib/db/client";
import { getSessionUser, clearSessionCookie } from "@/lib/auth/cookies";

export async function POST() {
  await runMigrations();
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  const db = getDb();
  // Cascade delete handles related rows via foreign keys.
  await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [user.id] });

  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
