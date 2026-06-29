import { NextResponse } from "next/server";
import { runMigrations } from "@/lib/db/schema";
import { getDb } from "@/lib/db/client";
import { createClient } from "@/lib/local/server";

export async function POST() {
  await runMigrations();
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  const db = getDb();
  // Cascade delete handles related rows via foreign keys.
  await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [user.id] });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("medassist-session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
  return res;
}
