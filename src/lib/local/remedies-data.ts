// src/lib/local/remedies-data.ts
// Static, curated remedy data. Shared by the remedies API route and the
// saved-remedies lookup so we don't need a remedies table.

export interface StaticRemedy {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  preparation_method: string;
  usage_instructions: string;
  precautions: string;
  remedy_type: "herbal" | "home" | "ayurvedic" | "traditional";
  effectiveness_rating: number;
}

export const DEFAULT_REMEDIES: ReadonlyArray<StaticRemedy> = [
  {
    id: "1",
    name: "Ginger Honey Tea",
    description: "Soothing tea for cold, cough, and sore throat.",
    ingredients: ["Fresh ginger (1 inch)", "Honey (2 tbsp)", "Lemon juice (1 tbsp)", "Hot water (1 cup)"],
    preparation_method: "Slice ginger thinly, boil in water for 5-10 minutes. Strain, add honey and lemon when cooled.",
    usage_instructions: "Drink 2-3 cups daily. Best consumed warm.",
    precautions: "Avoid if allergic to ginger. Diabetics should limit honey. Not for children under 1 year.",
    remedy_type: "herbal",
    effectiveness_rating: 4.5,
  },
  {
    id: "2",
    name: "Turmeric Golden Milk",
    description: "Anti-inflammatory drink for joint pain and immunity.",
    ingredients: ["Turmeric powder (1 tsp)", "Milk (1 cup)", "Black pepper (pinch)", "Honey (1 tsp)"],
    preparation_method: "Heat milk, add turmeric and black pepper. Simmer for 5 minutes.",
    usage_instructions: "Drink once daily, preferably before bed.",
    precautions: "May interact with blood thinners.",
    remedy_type: "ayurvedic",
    effectiveness_rating: 4.7,
  },
  {
    id: "3",
    name: "Saltwater Gargle",
    description: "Simple remedy for sore throat and mouth infections.",
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
    ingredients: ["Peppermint leaves or oil (5-10 drops)", "Boiling water (4 cups)"],
    preparation_method: "Add peppermint to boiling water in a bowl. Inhale steam under towel.",
    usage_instructions: "Inhale steam for 5-10 minutes. Repeat 2-3 times daily.",
    precautions: "Keep safe distance to avoid burns. Not for asthmatics without doctor's advice.",
    remedy_type: "herbal",
    effectiveness_rating: 4.4,
  },
  {
    id: "5",
    name: "Chamomile Sleep Tea",
    description: "Natural sedative that helps with insomnia and anxiety.",
    ingredients: ["Dried chamomile (2 tbsp)", "Hot water (1 cup)"],
    preparation_method: "Steep chamomile in hot water for 5-10 minutes.",
    usage_instructions: "Drink 30-45 minutes before bedtime.",
    precautions: "Avoid if allergic to ragweed.",
    remedy_type: "herbal",
    effectiveness_rating: 4.6,
  },
  {
    id: "6",
    name: "Aloe Vera Gel",
    description: "Soothes skin rashes, burns, and dry skin.",
    ingredients: ["Fresh aloe vera leaf or pure aloe gel"],
    preparation_method: "Cut aloe leaf and extract clear gel.",
    usage_instructions: "Apply thin layer to affected area 2-3 times daily.",
    precautions: "Do patch test first.",
    remedy_type: "traditional",
    effectiveness_rating: 4.5,
  },
];
