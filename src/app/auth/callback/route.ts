// src/app/auth/callback/route.ts
// OAuth callback handler. With the local backend, OAuth providers are not
// configured — this route redirects users back to login with a clear
// message. Email + password auth works via the local backend.

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const error = requestUrl.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=${encodeURIComponent(error)}`
    );
  }
  return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=oauth_not_configured`);
}
