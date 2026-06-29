import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runMigrations } from "@/lib/db/schema";
import { getDb } from "@/lib/db/client";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_DURATION_SECONDS } from "@/lib/auth/jwt";

const COOKIE_NAME = "medassist-session";

const LoginSchema = z.object({
  email: z.string().email().max(255),
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
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Invalid input" } },
      { status: 400 }
    );
  }

  const db = getDb();
  const email = parsed.data.email.toLowerCase().trim();

  const result = await db.execute({
    sql: "SELECT id, email, password_hash, full_name FROM users WHERE email = ?",
    args: [email],
  });
  const row = result.rows[0];
  if (!row) {
    return NextResponse.json(
      { error: { message: "Invalid email or password." } },
      { status: 401 }
    );
  }
  const ok = await verifyPassword(parsed.data.password, row.password_hash as string);
  if (!ok) {
    return NextResponse.json(
      { error: { message: "Invalid email or password." } },
      { status: 401 }
    );
  }

  const token = await createSessionToken(row.id as string, row.email as string);
  const res = NextResponse.json({
    session: {
      access_token: token,
      token_type: "bearer",
      user: {
        id: row.id,
        email: row.email,
        user_metadata: { full_name: (row.full_name as string) || "" },
      },
    },
  });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
  });
  return res;
}
