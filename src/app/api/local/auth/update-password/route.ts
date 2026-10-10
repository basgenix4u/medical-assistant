// src/app/api/local/auth/update-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  changePassword,
  resetPasswordWithToken,
} from "@/lib/auth/service";
import { getSessionTokenFromRequest } from "@/lib/auth/cookies";
import { verifySessionToken } from "@/lib/auth/jwt";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { log, getRequestId } from "@/lib/logging";

const Schema = z.object({
  password: z.string().min(8).max(200),
  // Session-based change: current password is verified server-side.
  current_password: z.string().min(1).max(200).optional(),
  // Reset flow: single-use token from the reset email.
  token: z.string().min(10).max(200).optional(),
});

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);

  // Rate limit: 5 attempts / minute per IP.
  const rl = rateLimit({
    key: `updatepw:${getClientIp(request)}`,
    limit: 5,
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
    return NextResponse.json(
      { error: { message: "Invalid input" } },
      { status: 400 }
    );
  }

  // Path 1: reset flow with a single-use token.
  if (parsed.data.token) {
    const result = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
    if (result.error) {
      return NextResponse.json(
        { error: { message: result.error.message } },
        { status: result.error.status }
      );
    }
    log.info({ msg: "password reset ok", requestId });
    return NextResponse.json({ ok: true });
  }

  // Path 2: signed-in user changing their password — current password required.
  const token = await getSessionTokenFromRequest();
  if (!token) {
    return NextResponse.json(
      { error: { message: "Not authenticated" } },
      { status: 401 }
    );
  }
  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ error: { message: "Invalid session" } }, { status: 401 });
  }
  if (!parsed.data.current_password) {
    return NextResponse.json(
      { error: { message: "Current password is required." } },
      { status: 400 }
    );
  }
  const result = await changePassword(
    payload.sub,
    parsed.data.current_password,
    parsed.data.password,
    payload.jti
  );
  if (result.error) {
    return NextResponse.json(
      { error: { message: result.error.message } },
      { status: result.error.status }
    );
  }
  log.info({ msg: "password changed", requestId, userId: payload.sub });
  return NextResponse.json({ ok: true });
}
