// src/app/api/analyze/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeSymptoms } from "@/lib/ai";
import { createClient } from "@/lib/local/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

import { DEFAULT_REMEDIES } from "@/lib/local/remedies-data";
// Map to the simplified shape that the analyze response uses
const FALLBACK_REMEDIES = DEFAULT_REMEDIES.map((r) => ({
  id: r.id,
  name: r.name,
  description: r.description,
  remedy_type: r.remedy_type,
}));


const AnalyzeRequestSchema = z.object({
  symptoms: z
    .array(z.string().min(1).max(100))
    .min(1, "Please provide at least one symptom")
    .max(30, "Too many symptoms provided"),
  description: z.string().max(2000).optional().default(""),
  duration: z.string().max(100).optional().default("Not specified"),
  severity: z.number().min(1).max(10).optional().default(5),
});

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in to use this endpoint." },
      { status: 401 }
    );
  }

  // Rate limit: 10 req / minute per IP
  const ip = getClientIp(request);
  const rl = rateLimit({ key: `analyze:${ip}`, limit: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  // Validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { symptoms, description, duration, severity } = parsed.data;

  try {
    // AI Analysis
    const analysis = await analyzeSymptoms({
      symptoms,
      description,
      duration,
      severity,
    });

    // Always use the curated fallback remedies list. (Remedies are
    // static content, not per-user data; no DB lookup needed.)
    const remedies = FALLBACK_REMEDIES;

    // Build response
    const result = {
      severity: analysis.severity,
      conditions: analysis.conditions || [],
      recommendations: analysis.recommendations || [],
      remedies: remedies,
      warningFlags: analysis.warningFlags || [],
      followUpNeeded: analysis.followUpNeeded || false,
      isEmergency: analysis.isEmergency ?? false,
      emergencyMessage: analysis.emergencyMessage,
      disclaimer:
        "This analysis is for informational purposes only and is NOT a medical diagnosis. Please consult a qualified healthcare provider for proper evaluation and treatment.",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze symptoms. Please try again." },
      { status: 500 }
    );
  }
}
