// POST /api/local/auth/magic-link/request
// Sends a magic link to the user's email. If user doesn't exist, creates one.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { runMigrations } from "@/lib/db/schema";
import { getDb } from "@/lib/db/client";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createMagicLinkToken } from "@/lib/auth/jwt";
import { sendEmail, magicLinkEmail } from "@/lib/email";

const COOKIE_NAME = "medassist-session";

const Schema = z.object({
  email: z.string().email().max(255),
});

export async function POST(request: NextRequest) {
  await runMigrations();
  const ip = getClientIp(request);
  const rl = rateLimit({ key: `magic:${ip}`, limit: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: { message: "Too many requests. Please wait a minute." } },
      { status: 429 }
    );
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: { message: "Invalid JSON" } }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: "Invalid email" } }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const db = getDb();

  // Get or create user
  let userId: string;
  const existing = await db.execute({
    sql: "SELECT id, full_name FROM users WHERE email = ?",
    args: [email],
  });
  if (existing.rows.length === 0) {
    // Auto-create account for first-time magic-link users
    userId = randomUUID();
    await db.execute({
      sql: "INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)",
      args: [userId, email, "!", "Friend"], // password_hash = "!" means password login disabled
    });
    await db.execute({
      sql: "INSERT INTO user_preferences (user_id) VALUES (?)",
      args: [userId],
    });
  } else {
    userId = existing.rows[0].id as string;
  }

  // Issue magic link JWT
  const token = await createMagicLinkToken(userId, email);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${baseUrl}/auth/magic-link/verify?token=${encodeURIComponent(token)}`;

  await sendEmail({
    to: email,
    ...magicLinkEmail(link, email),
  });

  return NextResponse.json({ ok: true });
}
