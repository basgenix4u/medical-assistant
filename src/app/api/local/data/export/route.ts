import { NextResponse } from "next/server";
import { runMigrations } from "@/lib/db/schema";
import { getDb } from "@/lib/db/client";
import { createClient } from "@/lib/local/server";

export async function GET() {
  await runMigrations();
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  const db = getDb();
  const [profile, prefs, consults, saved, ratings, chats] = await Promise.all([
    db.execute({ sql: "SELECT * FROM users WHERE id = ?", args: [user.id] }),
    db.execute({ sql: "SELECT * FROM user_preferences WHERE user_id = ?", args: [user.id] }),
    db.execute({ sql: "SELECT * FROM consultations WHERE user_id = ? ORDER BY created_at DESC", args: [user.id] }),
    db.execute({ sql: "SELECT * FROM saved_remedies WHERE user_id = ? ORDER BY created_at DESC", args: [user.id] }),
    db.execute({ sql: "SELECT * FROM remedy_ratings WHERE user_id = ?", args: [user.id] }),
    db.execute({ sql: "SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at", args: [user.id] }),
  ]);
  return NextResponse.json({
    profile: profile.rows[0] || null,
    preferences: prefs.rows[0] || null,
    consultations: consults.rows,
    saved_remedies: saved.rows,
    ratings: ratings.rows,
    chat_history: chats.rows,
    exported_at: new Date().toISOString(),
  });
}
