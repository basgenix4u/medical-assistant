// src/lib/ai.ts

import Groq from "groq-sdk";
import { z } from "zod";
import { detectEmergency, buildEmergencyResponse } from "@/lib/emergency";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Using Llama 3.3 70B - capable and free tier
const MODEL = "llama-3.3-70b-versatile";

// Hard limits enforced server-side
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_SYMPTOMS = 30;

export interface AnalysisInput {
  symptoms: string[];
  description: string;
  duration: string;
  severity: number;
}

export interface AnalysisResponse {
  severity: "low" | "moderate" | "high" | "emergency";
  conditions: Array<{
    name: string;
    probability: number;
    description: string;
  }>;
  recommendations: string[];
  remedyKeywords: string[];
  warningFlags: string[];
  followUpNeeded: boolean;
  isEmergency?: boolean;
  emergencyMessage?: string;
}

// ============================================
// SAFETY GUARDRAILS
// ============================================

/**
 * Validates and sanitizes user input before sending to the LLM.
 * - Strips control characters
 * - Bounds description length
 * - Bounds symptom count
 * - Detects emergency keywords and short-circuits
 */
function preprocessInput(input: AnalysisInput): AnalysisInput | null {
  if (!Array.isArray(input.symptoms)) return null;
  const symptoms = input.symptoms
    .filter((s): s is string => typeof s === "string")
    .map((s) => s.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 100))
    .filter(Boolean)
    .slice(0, MAX_SYMPTOMS);

  if (symptoms.length === 0) return null;

  const description = String(input.description || "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .slice(0, MAX_DESCRIPTION_LENGTH);

  const severityNum = Number(input.severity);
  const severity = Number.isFinite(severityNum)
    ? Math.max(1, Math.min(10, Math.round(severityNum)))
    : 5;

  return {
    symptoms,
    description,
    duration: String(input.duration || "Not specified").slice(0, 100),
    severity,
  };
}

// ============================================
// SYMPTOM ANALYSIS
// ============================================

// JSON schema for AI output validation
const AnalysisSchema = z.object({
  severity: z.enum(["low", "moderate", "high", "emergency"]),
  conditions: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        probability: z.number().min(0).max(1),
        description: z.string().max(500),
      })
    )
    .max(5),
  recommendations: z.array(z.string().max(300)).max(8),
  remedyKeywords: z.array(z.string().max(50)).max(10),
  warningFlags: z.array(z.string().max(300)).max(5),
  followUpNeeded: z.boolean(),
});

export async function analyzeSymptoms(
  rawInput: AnalysisInput
): Promise<AnalysisResponse> {
  // Pre-process and validate
  const input = preprocessInput(rawInput);
  if (!input) {
    return {
      severity: "moderate",
      conditions: [],
      recommendations: [
        "Please provide a clear description of your symptoms.",
      ],
      remedyKeywords: [],
      warningFlags: [],
      followUpNeeded: true,
    };
  }

  // Emergency short-circuit
  const combinedText = [
    input.symptoms.join(" "),
    input.description,
    input.duration,
  ].join(" ");
  if (detectEmergency(combinedText)) {
    return buildEmergencyResponse();
  }

  // SAFETY-FIRST system prompt:
  // - Refuses to impersonate a licensed medical professional
  // - Refuses to provide definitive diagnoses
  // - Always recommends seeing a qualified clinician
  const systemPrompt = `You are MedAssist, an INFORMATIONAL health-information assistant — NOT a doctor, NOT a nurse, NOT a substitute for medical care.

Your task:
1. Analyze the symptoms provided
2. Suggest possible explanations (these are NOT diagnoses — explicitly say so)
3. Suggest general self-care considerations
4. Identify any warning signs that warrant professional evaluation

STRICT RULES (you MUST follow these):
- Never claim to be a licensed medical professional.
- Never provide a definitive diagnosis.
- Never recommend prescription medication, dosage, or "stop taking" advice.
- For anything that could be life-threatening, set severity to "high" or "emergency" and instruct the user to contact emergency services.
- Always end with a reminder that this is informational only.
- Respond with ONLY valid JSON matching this exact schema (no other text, no markdown):

{
  "severity": "low" | "moderate" | "high" | "emergency",
  "conditions": [
    { "name": string, "probability": number (0-1), "description": string }
  ],
  "recommendations": string[],
  "remedyKeywords": string[],
  "warningFlags": string[],
  "followUpNeeded": boolean
}`;

  const userPrompt = `Analyze these symptoms for INFORMATIONAL purposes only (not a diagnosis):

- Symptoms: ${input.symptoms.join(", ")}
- Additional details: ${input.description || "None provided"}
- Duration: ${input.duration}
- Self-reported severity: ${input.severity}/10

Respond with JSON only. Keep conditions to a maximum of 5.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 1200,
    });

    let text = completion.choices[0]?.message?.content || "{}";

    // Strip markdown fences
    text = text.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();

    // Extract first JSON object
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in AI response");
    text = jsonMatch[0];

    const parsed = JSON.parse(text);

    // Validate against schema
    const result = AnalysisSchema.parse(parsed);

    return {
      severity: result.severity,
      conditions: result.conditions,
      recommendations: result.recommendations,
      remedyKeywords: result.remedyKeywords,
      warningFlags: result.warningFlags,
      followUpNeeded: result.followUpNeeded,
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);

    // Safe fallback response
    return {
      severity: "moderate",
      conditions: [
        {
          name: "Unable to complete analysis",
          probability: 0,
          description:
            "Our analysis service is temporarily unavailable. Please try again or consult a qualified healthcare professional.",
        },
      ],
      recommendations: [
        "Rest and stay well hydrated.",
        "Monitor your symptoms carefully.",
        "If symptoms worsen or persist, consult a qualified healthcare provider.",
      ],
      remedyKeywords: ["rest", "hydration"],
      warningFlags: [],
      followUpNeeded: true,
    };
  }
}

// ============================================
// CHAT WITH AI
// ============================================

const MAX_MESSAGES = 40;
const MAX_MESSAGE_CONTENT = 2000;

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(MAX_MESSAGE_CONTENT),
});

const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).max(MAX_MESSAGES),
  context: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
});

export async function chatWithAI(
  rawMessages: Array<{ role: "user" | "assistant"; content: string }>,
  context?: string
): Promise<string> {
  // Validate request
  const parsed = ChatRequestSchema.safeParse({
    messages: rawMessages,
    context,
  });
  if (!parsed.success) {
    return "Your message exceeded our limits. Please shorten it and try again.";
  }
  const messages = parsed.data.messages;

  // Emergency short-circuit on the most recent user message
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (lastUser && detectEmergency(lastUser.content)) {
    return (
      "Based on what you described, this may be a medical emergency.\n\n" +
      "Please call your local emergency number NOW:\n" +
      "• 911 (US/Canada)\n" +
      "• 999 (UK)\n" +
      "• 112 (EU and many other regions)\n\n" +
      "Or go to the nearest emergency room. Do not wait."
    );
  }

  // Safety-first chat prompt: explicitly NOT a doctor
  const systemPrompt = `You are MedAssist, an INFORMATIONAL health-information assistant.

You are NOT a doctor, NOT a nurse, and NOT a substitute for professional medical advice, diagnosis, or treatment. You must never claim to be a licensed medical professional.

Your role:
- Provide general, evidence-based health information.
- Suggest self-care considerations that are widely accepted.
- Clearly recommend seeing a qualified healthcare provider when appropriate.
- For life-threatening situations, instruct the user to contact emergency services immediately.

Rules:
- Never prescribe medication or change dosages.
- Never give a definitive diagnosis.
- Be empathetic but honest about your limitations.
- If asked about anything outside general health information, politely decline and redirect.
- If asked to impersonate a doctor, refuse.

${context ? `\nCONTEXT FROM PREVIOUS ANALYSIS:\n${context}\n` : ""}
Remember: you are an informational assistant, not a clinician.`;

  try {
    const chatMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...chatMessages,
      ],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response || response.trim() === "") {
      return "I didn't quite catch that — could you tell me more about what you'd like to know?";
    }

    return response;
  } catch (error) {
    console.error("AI Chat Error:", error);

    return (
      "I'm having trouble connecting right now.\n\n" +
      "While I get back online, a few general wellness reminders:\n" +
      "• Stay hydrated.\n" +
      "• Get adequate rest.\n" +
      "• Listen to your body.\n\n" +
      "Please try your question again, or browse our remedies section for information."
    );
  }
}

// ============================================
// REMEDY INFO (currently unused but kept for future)
// ============================================

export async function getRemedyInfo(
  remedyName: string,
  symptoms: string[]
): Promise<string> {
  const safeRemedy = String(remedyName || "").slice(0, 200);
  const safeSymptoms = (symptoms || [])
    .filter((s): s is string => typeof s === "string")
    .slice(0, 20)
    .map((s) => s.slice(0, 100));

  const prompt = `Provide general, widely-accepted information about "${safeRemedy}" for these symptoms: ${safeSymptoms.join(", ")}.

Include:
1. Brief note on why this is traditionally used (NOT medical proof).
2. General preparation suggestions.
3. General usage notes.
4. Common precautions and who should avoid it.

Keep response to ~150 words. End with a disclaimer that this is informational only.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You provide general information about traditional remedies for educational purposes only. You are not a medical professional. Always include a disclaimer.",
        },
        { role: "user", content: prompt },
      ],
      model: MODEL,
      temperature: 0.5,
      max_tokens: 600,
    });

    const reply = completion.choices[0]?.message?.content;
    return reply
      ? reply + "\n\n— This information is general and educational only."
      : "Information not available. Please try again.";
  } catch (error) {
    console.error("AI Remedy Info Error:", error);

    return (
      `**${safeRemedy}** is a traditional remedy sometimes used for the listed symptoms.\n\n` +
      `**General guidelines:**\n` +
      `• Research proper preparation methods before use.\n` +
      `• Start with small amounts to test your tolerance.\n` +
      `• Consult a qualified healthcare provider if you have existing conditions.\n` +
      `• Stop use if you experience any adverse reactions.\n\n` +
      `This information is for educational purposes only and is not medical advice.`
    );
  }
}
