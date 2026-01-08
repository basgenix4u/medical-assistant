// src/app/api/analyze/route.ts

import { NextRequest, NextResponse } from "next/server";
import { analyzeSymptoms } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";

// Fallback remedies
const FALLBACK_REMEDIES = [
  {
    id: "1",
    name: "Ginger Honey Tea",
    description: "Soothing tea for cold, cough, and sore throat. Ginger has anti-inflammatory properties.",
    remedy_type: "herbal",
  },
  {
    id: "2",
    name: "Turmeric Golden Milk",
    description: "Anti-inflammatory drink for joint pain and immunity support.",
    remedy_type: "ayurvedic",
  },
  {
    id: "3",
    name: "Saltwater Gargle",
    description: "Simple remedy for sore throat and mouth infections.",
    remedy_type: "home",
  },
  {
    id: "4",
    name: "Peppermint Steam Inhalation",
    description: "Clears nasal congestion and relieves headaches.",
    remedy_type: "herbal",
  },
  {
    id: "5",
    name: "Chamomile Tea",
    description: "Calming tea that helps with sleep and anxiety.",
    remedy_type: "herbal",
  },
  {
    id: "6",
    name: "Apple Cider Vinegar Tonic",
    description: "Aids digestion and helps with bloating.",
    remedy_type: "home",
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symptoms, description, duration, severity } = body;

    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one symptom" },
        { status: 400 }
      );
    }

    // AI Analysis
    const analysis = await analyzeSymptoms({
      symptoms,
      description: description || "",
      duration: duration || "Not specified",
      severity: severity || 5,
    });

    // Try to fetch remedies from database
    let remedies = FALLBACK_REMEDIES;
    try {
      const supabase = await createClient();
      const { data } = await supabase.from("remedies").select("*").limit(6);
      if (data && data.length > 0) {
        remedies = data;
      }
    } catch (dbError) {
      console.log("Using fallback remedies");
    }

    // Build response
    const result = {
      severity: analysis.severity,
      conditions: analysis.conditions || [],
      recommendations: analysis.recommendations || [],
      remedies: remedies,
      warningFlags: analysis.warningFlags || [],
      followUpNeeded: analysis.followUpNeeded || false,
      disclaimer:
        "This analysis is for informational purposes only and is not a substitute for professional medical advice. Please consult a healthcare provider for proper diagnosis and treatment.",
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