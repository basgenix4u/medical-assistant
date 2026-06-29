import { NextResponse } from "next/server";
import { createClient } from "@/lib/local/server";

export async function GET() {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
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
