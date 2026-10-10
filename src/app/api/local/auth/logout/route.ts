// src/app/api/local/auth/logout/route.ts
import { NextResponse } from "next/server";
import { logoutWithToken } from "@/lib/auth/service";
import { getSessionTokenFromRequest, clearSessionCookie } from "@/lib/auth/cookies";

export async function POST() {
  // Revoke the session server-side (gap G4), then clear the cookie.
  const token = await getSessionTokenFromRequest();
  if (token) await logoutWithToken(token);
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
