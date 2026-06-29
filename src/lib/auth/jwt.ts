// src/lib/auth/jwt.ts
import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ||
    "dev-only-secret-change-me-in-production-please-please-please"
);

const ALG = "HS256";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const RESET_DURATION_MS = 1000 * 60 * 60; // 1 hour

export interface SessionPayload {
  sub: string; // user id
  email: string;
  iat: number;
  exp: number;
}

export async function createSessionToken(userId: string, email: string): Promise<string> {
  return await new SignJWT({ sub: userId, email })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + SESSION_DURATION_MS) / 1000))
    .sign(SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  return await new SignJWT({ sub: userId, kind: "reset" })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + RESET_DURATION_MS) / 1000))
    .sign(SECRET);
}

export async function verifyPasswordResetToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if ((payload as { kind?: string }).kind !== "reset") return null;
    return { userId: payload.sub as string };
  } catch {
    return null;
  }
}

export const SESSION_DURATION_SECONDS = SESSION_DURATION_MS / 1000;
export const RESET_DURATION_SECONDS = RESET_DURATION_MS / 1000;
