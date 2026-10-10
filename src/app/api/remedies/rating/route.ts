// src/app/api/remedies/rating/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runMigrations } from "@/lib/db/schema";
import { getDb } from "@/lib/db/client";
import { getSessionUser } from "@/lib/auth/cookies";

/**
 * Aggregate rating for a remedy (across all users).
 * GET /api/remedies/rating?remedy_id=<id> → { average, count }
 */
export async function GET(request: NextRequest) {
  await runMigrations();
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: { message: "Unauthorized" } },
      { status: 401 }
    );
  }
  const remedyId = new URL(request.url).searchParams.get("remedy_id");
  if (!remedyId) {
    return NextResponse.json(
      { error: { message: "remedy_id is required" } },
      { status: 400 }
    );
  }
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT AVG(rating) AS average, COUNT(*) AS count FROM remedy_ratings WHERE remedy_id = ?",
    args: [remedyId],
  });
  const row = result.rows[0];
  const average = row?.average != null ? Math.round(Number(row.average) * 10) / 10 : 0;
  const count = Number(row?.count ?? 0);
  return NextResponse.json({ average, count });
}
