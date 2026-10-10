// src/app/api/remedies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runMigrations } from "@/lib/db/schema";
import { getDb } from "@/lib/db/client";
import { getSessionUser } from "@/lib/auth/cookies";
import { DEFAULT_REMEDIES } from "@/lib/local/remedies-data";

export async function GET(request: NextRequest) {
  await runMigrations();
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: { message: "Unauthorized" } },
      { status: 401 }
    );
  }
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";

  let data = type
    ? DEFAULT_REMEDIES.filter((r) => r.remedy_type === type)
    : [...DEFAULT_REMEDIES];
  if (q) {
    data = data.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.ingredients.some((i) => i.toLowerCase().includes(q))
    );
  }

  // Attach aggregate user ratings (average + count) per remedy.
  const db = getDb();
  const agg = await db.execute(
    "SELECT remedy_id, AVG(rating) AS avg_rating, COUNT(*) AS ratings_count FROM remedy_ratings GROUP BY remedy_id"
  );
  const aggMap = new Map<string, { average_rating: number; ratings_count: number }>();
  for (const row of agg.rows) {
    const average =
      row.avg_rating != null ? Math.round(Number(row.avg_rating) * 10) / 10 : 0;
    aggMap.set(row.remedy_id as string, {
      average_rating: average,
      ratings_count: Number(row.ratings_count),
    });
  }
  const enriched = data.map((r) => ({
    ...r,
    ...(aggMap.get(r.id) ?? {
      average_rating: r.effectiveness_rating,
      ratings_count: 0,
    }),
  }));

  return NextResponse.json(enriched, {
    headers: { "Cache-Control": "private, max-age=300" },
  });
}
