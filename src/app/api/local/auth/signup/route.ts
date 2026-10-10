// src/app/api/local/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signupUser } from "@/lib/auth/service";
import { setSessionCookie } from "@/lib/auth/cookies";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { log, getRequestId } from "@/lib/logging";

const SignupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200),
  full_name: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);

  // Rate limit: 5 signups / minute per IP.
  const rl = rateLimit({
    key: `signup:${getClientIp(request)}`,
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
  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: parsed.error.errors[0]?.message || "Invalid input" } },
      { status: 400 }
    );
  }

  const result = await signupUser(parsed.data);
  if (result.error) {
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
  log.info({ msg: "signup ok", requestId, userId: user.id });
  return res;
}
