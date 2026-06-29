import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/local/server";
import { DEFAULT_REMEDIES } from "@/lib/local/remedies-data";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: { message: "Unauthorized" } },
      { status: 401 }
    );
  }
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const data = type
    ? DEFAULT_REMEDIES.filter((r) => r.remedy_type === type)
    : DEFAULT_REMEDIES;
  return NextResponse.json(data, {
    headers: { "Cache-Control": "private, max-age=300" },
  });
}
