// src/app/api/local/auth/me/route.ts
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/cookies";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      user_metadata: { full_name: user.full_name || "" },
    },
  });
}
