// src/app/api/local/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isProd } from "@/lib/env";
import { requestPasswordReset } from "@/lib/auth/service";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { log, getRequestId } from "@/lib/logging";

const Schema = z.object({ email: z.string().email().max(255) });

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);

  // Rate limit: 3 requests / minute per IP (prevents abuse + enumeration).
  const rl = rateLimit({
    key: `reset:${getClientIp(request)}`,
    limit: 3,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: { message: "Too many attempts. Please try again in a minute." } },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

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

  // Always returns ok — never reveals whether the account exists.
  const { resetUrl } = await requestPasswordReset(parsed.data.email);
  log.info({ msg: "password reset requested", requestId });

  // In development the console mailer is used; surface the link so the
  // flow stays testable. Never leak it in production.
  return NextResponse.json(
    isProd ? { ok: true } : { ok: true, ...(resetUrl ? { resetUrl } : {}) }
  );
}
