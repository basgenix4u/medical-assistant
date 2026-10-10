// src/lib/auth/jwt.ts
import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "crypto";
import { AUTH_SECRET } from "@/lib/env";

const SECRET = new TextEncoder().encode(AUTH_SECRET);

const ALG = "HS256";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  sub: string; // user id
  email: string;
  jti: string; // session id — used for server-side revocation
  iat: number;
  exp: number;
}

export interface IssuedSessionToken {
  token: string;
  jti: string;
  expiresAt: number; // unix seconds
}

export async function createSessionToken(
  userId: string,
  email: string
): Promise<IssuedSessionToken> {
  const jti = randomUUID();
  const expiresAt = Math.floor((Date.now() + SESSION_DURATION_MS) / 1000);
  const token = await new SignJWT({ sub: userId, email, jti })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(SECRET);
  return { token, jti, expiresAt };
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const p = payload as unknown as Partial<SessionPayload>;
    if (!p.sub || !p.jti) return null;
    return p as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_DURATION_SECONDS = SESSION_DURATION_MS / 1000;
