// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

/**
 * Smoke-test / health-check endpoint (no auth required).
 * Used for Stage 2 environment verification, uptime probes, and load balancers.
 */
export async function GET() {
  try {
    await runMigrations();
    const db = getDb();
    await db.execute("SELECT 1");
    return NextResponse.json({
      status: "ok",
      db: "ok",
      version: process.env.npm_package_version ?? "0.2.0",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: "error", db: "error", error: "health check failed" },
      { status: 503 }
    );
  }
}
