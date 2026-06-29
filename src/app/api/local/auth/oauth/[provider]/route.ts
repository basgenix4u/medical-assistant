import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  // OAuth is not configured in the local backend. Provide a clear message
  // and redirect to login.
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login?error=oauth_${provider}_not_configured`
  );
}
