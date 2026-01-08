// src/app/api/remedies/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Fallback remedies
const DEFAULT_REMEDIES = [
  {
    id: "1",
    name: "Ginger Honey Tea",
    description: "Soothing tea for cold, cough, and sore throat. Ginger has anti-inflammatory properties while honey soothes the throat.",
    ingredients: ["Fresh ginger (1 inch)", "Honey (2 tbsp)", "Lemon juice (1 tbsp)", "Hot water (1 cup)"],
    preparation_method: "Slice ginger thinly, boil in water for 5-10 minutes. Strain, add honey and lemon when cooled slightly.",
    usage_instructions: "Drink 2-3 cups daily. Best consumed warm.",
    precautions: "Avoid if allergic to ginger. Diabetics should limit honey. Not for children under 1 year.",
    remedy_type: "herbal",
    effectiveness_rating: 4.5,
  },
  {
    id: "2",
    name: "Turmeric Golden Milk",
    description: "Anti-inflammatory drink that helps with joint pain, boosts immunity, and aids sleep.",
    ingredients: ["Turmeric powder (1 tsp)", "Milk (1 cup)", "Black pepper (pinch)", "Honey (1 tsp)"],
    preparation_method: "Heat milk, add turmeric and black pepper. Simmer for 5 minutes. Add honey after removing from heat.",
    usage_instructions: "Drink once daily, preferably before bed.",
    precautions: "May interact with blood thinners. Avoid if you have gallbladder problems.",
    remedy_type: "ayurvedic",
    effectiveness_rating: 4.7,
  },
  {
    id: "3",
    name: "Saltwater Gargle",
    description: "Simple and effective remedy for sore throat and mouth infections.",
    ingredients: ["Warm water (1 cup)", "Salt (1/2 tsp)"],
    preparation_method: "Dissolve salt completely in warm water.",
    usage_instructions: "Gargle for 30 seconds, spit out. Repeat 3-4 times daily.",
    precautions: "Do not swallow. Not for children under 6.",
    remedy_type: "home",
    effectiveness_rating: 4.3,
  },
  {
    id: "4",
    name: "Peppermint Steam",
    description: "Clears nasal congestion and relieves headaches.",
    ingredients: ["Peppermint leaves or oil (5-10 drops)", "Boiling water (4 cups)", "Large bowl", "Towel"],
    preparation_method: "Add peppermint to boiling water in a bowl. Create a tent with towel over head.",
    usage_instructions: "Inhale steam for 5-10 minutes. Keep eyes closed. Repeat 2-3 times daily.",
    precautions: "Keep safe distance to avoid burns. Not for asthmatics without doctor's advice.",
    remedy_type: "herbal",
    effectiveness_rating: 4.4,
  },
  {
    id: "5",
    name: "Chamomile Sleep Tea",
    description: "Natural sedative that helps with insomnia and anxiety.",
    ingredients: ["Dried chamomile (2 tbsp) or tea bag", "Hot water (1 cup)", "Honey (optional)"],
    preparation_method: "Steep chamomile in hot water for 5-10 minutes. Strain and add honey if desired.",
    usage_instructions: "Drink 30-45 minutes before bedtime.",
    precautions: "Avoid if allergic to ragweed. May interact with sedatives.",
    remedy_type: "herbal",
    effectiveness_rating: 4.6,
  },
  {
    id: "6",
    name: "Aloe Vera Gel",
    description: "Soothes skin rashes, burns, and dry skin. Contains vitamins and anti-inflammatory compounds.",
    ingredients: ["Fresh aloe vera leaf or pure aloe gel"],
    preparation_method: "Cut aloe leaf and extract clear gel. Store in clean container.",
    usage_instructions: "Apply thin layer to affected area 2-3 times daily.",
    precautions: "Do patch test first. Do not use on deep wounds.",
    remedy_type: "traditional",
    effectiveness_rating: 4.5,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const supabase = await createClient();

    let query = supabase.from("remedies").select("*");

    if (type) {
      query = query.eq("remedy_type", type);
    }

    const { data: remedies, error } = await query.order("effectiveness_rating", {
      ascending: false,
    });

    if (error || !remedies || remedies.length === 0) {
      return NextResponse.json(DEFAULT_REMEDIES);
    }

    return NextResponse.json(remedies);
  } catch (error) {
    console.error("Remedies Error:", error);
    return NextResponse.json(DEFAULT_REMEDIES);
  }
}