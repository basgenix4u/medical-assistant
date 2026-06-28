/**
 * Emergency keyword detection for symptom analysis and chat.
 * Used to escalate potential medical emergencies to a structured response
 * that surfaces local emergency-services UI to the user.
 *
 * IMPORTANT: This is a heuristic. It is intentionally broad. False positives
 * are acceptable; false negatives are not. The system must NEVER diagnose
 * — only signal that the user should contact emergency services.
 */

const EMERGENCY_KEYWORDS: ReadonlyArray<string> = [
  // Cardiac
  "chest pain",
  "crushing chest",
  "pressure in chest",
  "heart attack",
  // Respiratory
  "can't breathe",
  "cannot breathe",
  "can't catch my breath",
  "choking",
  "severe shortness of breath",
  "gasping for air",
  // Stroke
  "stroke",
  "face drooping",
  "slurred speech",
  "sudden weakness on one side",
  "can't move my arm",
  "can't move my leg",
  // Bleeding / trauma
  "uncontrolled bleeding",
  "bleeding won't stop",
  "severe bleeding",
  "head trauma",
  "lost consciousness",
  // Anaphylaxis
  "throat closing",
  "tongue swelling",
  "severe allergic reaction",
  "anaphylaxis",
  // Pregnancy
  "severe abdominal pain pregnant",
  // Mental health
  "suicidal",
  "want to die",
  "kill myself",
  "end my life",
  "suicide",
  // Other
  "seizure",
  "unconscious",
  "not breathing",
  "blue lips",
  "blue fingernails",
  "severe allergic",
  "poisoning",
  "overdose",
];

const EMERGENCY_REGEX: ReadonlyArray<RegExp> = [
  /\b911\b/i,
  /\b999\b/i,
  /\b112\b/i,
  /\bambulance\b/i,
];

/**
 * Returns true if any emergency keyword or regex is found in `text`.
 */
export function detectEmergency(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  const lower = text.toLowerCase();
  if (EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw))) return true;
  if (EMERGENCY_REGEX.some((rx) => rx.test(text))) return true;
  return false;
}

/**
 * Returns the standard emergency response object. The UI layer should
 * render an EmergencyBanner using this payload.
 */
export function buildEmergencyResponse() {
  return {
    severity: "emergency" as const,
    conditions: [],
    recommendations: [],
    remedyKeywords: [],
    warningFlags: [
      "Your message indicates a possible medical emergency. " +
        "Please contact your local emergency services immediately.",
    ],
    followUpNeeded: true,
    isEmergency: true,
    emergencyMessage:
      "Based on what you described, this may be a medical emergency. " +
      "Please call your local emergency number (911 in the US, 999 in the UK, " +
      "112 in the EU) or go to the nearest emergency room immediately.",
  };
}
