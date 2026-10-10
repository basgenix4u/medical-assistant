// src/app/api/local/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loginUser } from "@/lib/auth/service";
import { setSessionCookie } from "@/lib/auth/cookies";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { log, getRequestId } from "@/lib/logging";

const LoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);

  // Rate limit: 10 attempts / minute per IP (brute-force protection).
  const rl = rateLimit({
    key: `login:${getClientIp(request)}`,
    limit: 10,
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
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Invalid email or password." } },
      { status: 400 }
    );
  }

  const result = await loginUser(parsed.data);
  if (result.error) {
    log.warn({
      msg: "login failed",
      requestId,
      status: result.error.status,
    });
    return NextResponse.json(
      { error: { message: result.error.message } },
      { status: result.error.status }
    );
  }

  const { user, session } = result.data;
  // The session token is set ONLY as an httpOnly cookie — never in the body.
  const res = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      user_metadata: { full_name: user.full_name || "" },
    },
  });
  setSessionCookie(res, session.token);
  log.info({ msg: "login ok", requestId, userId: user.id });
  return res;
}
