import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runMigrations } from "@/lib/db/schema";
import { getDb } from "@/lib/db/client";
import { createPasswordResetToken } from "@/lib/auth/jwt";

const Schema = z.object({ email: z.string().email().max(255) });

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
    return NextResponse.json({ error: { message: "Invalid email" } }, { status: 400 });
  }

  const db = getDb();
  const email = parsed.data.email.toLowerCase().trim();
  const result = await db.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: [email],
  });

  // Always return ok to prevent email enumeration. If user exists, log the
  // reset link to the server console (in production, send via email provider).
  if (result.rows.length > 0) {
    const userId = result.rows[0].id as string;
    const token = await createPasswordResetToken(userId);
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password?token=${encodeURIComponent(token)}`;
    // eslint-disable-next-line no-console
    // Send via email service (falls back to console in dev)
    const { sendEmail, passwordResetEmail } = await import("@/lib/email");
    await sendEmail({
      to: email,
      ...passwordResetEmail(resetUrl),
    });
  }

  return NextResponse.json({ ok: true });
}
