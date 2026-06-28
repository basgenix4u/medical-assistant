// src/app/auth/callback/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Validate that a "next" path is a safe relative path to prevent open
 * redirect attacks.
 */
function safeNext(next: string | null): string {
  if (!next) return "/dashboard";
  // Must start with "/" but not "//" (protocol-relative URL)
  if (!next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNext(requestUrl.searchParams.get("next"));
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If there's an error, redirect to login with error message
  return NextResponse.redirect(`${origin}/auth/login?error=oauth_error`);
}
