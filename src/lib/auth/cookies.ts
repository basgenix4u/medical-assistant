// src/lib/auth/cookies.ts
/**
 * Route-facing session cookie helpers (gaps G1/G2).
 *
 * The session JWT lives ONLY in an httpOnly, Secure, SameSite=Strict cookie.
 * It is never returned in a response body and never stored in localStorage,
 * so XSS cannot read or steal it.
 */
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { isProd } from "@/lib/env";
import { SESSION_DURATION_SECONDS } from "@/lib/auth/jwt";
import { verifySession, type SessionUser } from "@/lib/auth/session";

export const SESSION_COOKIE = "medassist-session";

export async function getSessionTokenFromRequest(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProd,
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: isProd,
    maxAge: 0,
    path: "/",
  });
}

/** Returns the authenticated user for the current request, or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getSessionTokenFromRequest();
  if (!token) return null;
  return verifySession(token);
}
