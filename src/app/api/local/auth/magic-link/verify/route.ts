// POST /api/local/auth/magic-link/verify
// Exchanges a magic-link JWT for a session cookie.
import { NextRequest, NextResponse } from "next/server";
import { runMigrations } from "@/lib/db/schema";
import { getDb } from "@/lib/db/client";
import { verifyMagicLinkToken, SESSION_DURATION_SECONDS } from "@/lib/auth/jwt";

const COOKIE_NAME = "medassist-session";

export async function POST(request: NextRequest) {
  await runMigrations();
  const formData = await request.formData().catch(() => null);
  let token: string | null = null;
  if (formData) token = formData.get("token") as string;
  if (!token) {
    try {
      const json = await request.json();
      token = (json as { token?: string })?.token ?? null;
    } catch { /* ignore */ }
  }
  if (!token) {
    const url = new URL(request.url);
    token = url.searchParams.get("token");
  }
  if (!token) {
    return NextResponse.json(
      { error: { message: "Missing magic link token" } },
      { status: 400 }
    );
  }

  const payload = await verifyMagicLinkToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: { message: "Invalid or expired link" } },
      { status: 401 }
    );
  }

  // Upgrade the magic-link token into a session token
  const { createSessionToken } = await import("@/lib/auth/jwt");
  const sessionToken = await createSessionToken(payload.sub, payload.email);

  // Verify user still exists
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT id, email, full_name FROM users WHERE id = ?",
    args: [payload.sub],
  });
  if (result.rows.length === 0) {
    return NextResponse.json(
      { error: { message: "Account no longer exists" } },
      { status: 401 }
    );
  }
  const row = result.rows[0];

  const res = NextResponse.json({
    session: {
      access_token: sessionToken,
      token_type: "bearer",
      user: {
        id: row.id,
        email: row.email,
        user_metadata: { full_name: (row.full_name as string) || "" },
      },
    },
  });
  res.cookies.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
  });
  return res;
}
