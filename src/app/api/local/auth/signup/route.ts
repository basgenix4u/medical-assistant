import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { runMigrations } from "@/lib/db/schema";
import { getDb } from "@/lib/db/client";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { createSessionToken, SESSION_DURATION_SECONDS } from "@/lib/auth/jwt";

const COOKIE_NAME = "medassist-session";

const SignupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200),
  full_name: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  await runMigrations();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid JSON" } }, { status: 400 });
  }
  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.errors[0]?.message || "Invalid input" } },
      { status: 400 }
    );
  }
  const strength = validatePasswordStrength(parsed.data.password);
  if (!strength.ok) {
    return NextResponse.json(
      { error: { message: `Weak password: ${strength.errors.join(", ")}` } },
      { status: 400 }
    );
  }

  const db = getDb();
  const email = parsed.data.email.toLowerCase().trim();

  const existing = await db.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: [email],
  });
  if (existing.rows.length > 0) {
    return NextResponse.json(
      { error: { message: "An account with this email already exists." } },
      { status: 409 }
    );
  }

  const id = randomUUID();
  const passwordHash = await hashPassword(parsed.data.password);
  const fullName = parsed.data.full_name?.trim() || null;

  await db.execute({
    sql: "INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)",
    args: [id, email, passwordHash, fullName],
  });
  await db.execute({
    sql: "INSERT INTO user_preferences (user_id) VALUES (?)",
    args: [id],
  });

  const token = await createSessionToken(id, email);
  const res = NextResponse.json({
    session: {
      access_token: token,
      token_type: "bearer",
      user: {
        id,
        email,
        user_metadata: { full_name: fullName || "" },
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
