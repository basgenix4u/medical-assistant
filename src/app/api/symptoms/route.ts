// src/app/api/symptoms/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Fallback symptoms if database is empty
const DEFAULT_SYMPTOMS = [
  { id: "1", name: "Headache", category: "Neurological", body_part: "head" },
  { id: "2", name: "Fever", category: "General", body_part: "general" },
  { id: "3", name: "Cough", category: "Respiratory", body_part: "chest" },
  { id: "4", name: "Sore Throat", category: "Respiratory", body_part: "throat" },
  { id: "5", name: "Fatigue", category: "General", body_part: "general" },
  { id: "6", name: "Nausea", category: "Digestive", body_part: "abdomen" },
  { id: "7", name: "Body Ache", category: "Musculoskeletal", body_part: "general" },
  { id: "8", name: "Runny Nose", category: "Respiratory", body_part: "head" },
  { id: "9", name: "Stomach Pain", category: "Digestive", body_part: "abdomen" },
  { id: "10", name: "Dizziness", category: "Neurological", body_part: "head" },
  { id: "11", name: "Back Pain", category: "Musculoskeletal", body_part: "back" },
  { id: "12", name: "Joint Pain", category: "Musculoskeletal", body_part: "general" },
  { id: "13", name: "Skin Rash", category: "Dermatological", body_part: "skin" },
  { id: "14", name: "Insomnia", category: "Neurological", body_part: "general" },
  { id: "15", name: "Anxiety", category: "Mental Health", body_part: "general" },
  { id: "16", name: "Indigestion", category: "Digestive", body_part: "abdomen" },
  { id: "17", name: "Constipation", category: "Digestive", body_part: "abdomen" },
  { id: "18", name: "Muscle Cramps", category: "Musculoskeletal", body_part: "general" },
  { id: "19", name: "Dry Skin", category: "Dermatological", body_part: "skin" },
  { id: "20", name: "Eye Strain", category: "Neurological", body_part: "head" },
];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: symptoms, error } = await supabase
      .from("symptoms")
      .select("*")
      .order("name");

    if (error || !symptoms || symptoms.length === 0) {
      return NextResponse.json(DEFAULT_SYMPTOMS);
    }

    return NextResponse.json(symptoms);
  } catch (error) {
    console.error("Symptoms Error:", error);
    return NextResponse.json(DEFAULT_SYMPTOMS);
  }
}