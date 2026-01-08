// src/lib/ai.ts

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Using Llama 3.3 70B - very capable and free
const MODEL = "llama-3.3-70b-versatile";

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
}

// ============================================
// SYMPTOM ANALYSIS
// ============================================

export async function analyzeSymptoms(input: AnalysisInput): Promise<AnalysisResponse> {
  const systemPrompt = `You are MedAssist AI, a professional medical assistant that analyzes symptoms and suggests natural remedies.

Your task:
1. Analyze the symptoms provided
2. Assess severity (low, moderate, high, or emergency)
3. Suggest possible conditions (NOT diagnoses)
4. Provide helpful recommendations
5. Identify any warning signs

IMPORTANT: Respond with ONLY valid JSON, no other text. Use this exact format:
{
  "severity": "low",
  "conditions": [
    {"name": "Common Cold", "probability": 0.7, "description": "A viral infection of the upper respiratory tract"}
  ],
  "recommendations": ["Get plenty of rest", "Stay hydrated", "Try honey and lemon tea"],
  "remedyKeywords": ["honey", "ginger", "rest"],
  "warningFlags": [],
  "followUpNeeded": false
}`;

  const userPrompt = `Analyze these symptoms:
- Symptoms: ${input.symptoms.join(", ")}
- Additional details: ${input.description || "None provided"}
- Duration: ${input.duration || "Not specified"}
- Severity rating: ${input.severity}/10

Respond with JSON only.`;

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
    
    // Clean up the response
    text = text.replace(/```json\n?/gi, "");
    text = text.replace(/```\n?/gi, "");
    text = text.trim();

    // Extract JSON if there's extra text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    const parsed = JSON.parse(text);

    return {
      severity: parsed.severity || "low",
      conditions: parsed.conditions || [],
      recommendations: parsed.recommendations || [],
      remedyKeywords: parsed.remedyKeywords || [],
      warningFlags: parsed.warningFlags || [],
      followUpNeeded: parsed.followUpNeeded || false,
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    
    // Return helpful default response on error
    return {
      severity: "moderate",
      conditions: [
        {
          name: "Unable to Complete Analysis",
          probability: 0,
          description: "Please try again or consult a healthcare professional.",
        },
      ],
      recommendations: [
        "Rest and stay well hydrated",
        "Monitor your symptoms carefully",
        "If symptoms worsen or persist, consult a doctor",
        "Consider trying gentle home remedies for comfort",
      ],
      remedyKeywords: ["rest", "hydration", "comfort"],
      warningFlags: [],
      followUpNeeded: true,
    };
  }
}

// ============================================
// CHAT WITH AI
// ============================================

export async function chatWithAI(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  context?: string
): Promise<string> {
  const systemPrompt = `Act as a licensed emergency medical doctor with strong triage experience.
Your role is to quickly assess symptoms, prioritize patient safety, and identify red flags.
Communication style:
Calm, confident, authoritative
Empathetic but firm when danger is possible
Uses clear warnings without panic
Speaks like a real hospital doctor, not a chatbot
Consultation rules:
Start with reassurance, then immediately shift to risk assessment
Ask targeted yes/no questions to rule out life-threatening causes
Clearly state WHEN to go to the hospital immediately
Offer safe first-aid or temporary relief steps
Never diagnose without enough data
If symptoms are severe, escalate urgency decisively
Medical behavior:
Treat every complaint as potentially serious until proven otherwise
Separate common causes from dangerous causes
Use short, clear bullet points
Do not over-reassure when red flags exist
End every response by:
Asking for critical missing details
Re-emphasizing patient safety
You are not allowed to be casual, humorous, or dismissive.
You must behave like a doctor responsible for a real human life.

${context ? `\nCONTEXT FROM PREVIOUS ANALYSIS:\n${context}` : ""}

Remember: You're a doctors.`;

  try {
    const chatMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
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
      return "I'm here to help! Could you please tell me more about what you're experiencing or what you'd like to know?";
    }

    return response;
  } catch (error) {
    console.error("AI Chat Error:", error);
    
    return `I apologize, but I'm having a bit of trouble right now. 

While I get back on track, here are some general wellness tips:
• Stay hydrated by drinking plenty of water
• Get adequate rest and sleep
• If you're feeling unwell, listen to your body

Please try your question again, or feel free to browse our remedies section for helpful information!`;
  }
}

// ============================================
// GET REMEDY INFORMATION
// ============================================

export async function getRemedyInfo(
  remedyName: string,
  symptoms: string[]
): Promise<string> {
  const prompt = `as a doctor Provide helpful, practical information about using "${remedyName}" for these symptoms: ${symptoms.join(", ")}.

Include:
1. How it works and why it's beneficial
2. Simple preparation instructions
3. Recommended usage and dosage
4. Important precautions and warnings
5. When to avoid using it

Keep your response clear, friendly, and about 150-200 words. Use bullet points where helpful.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable herbalist and natural remedy expert, a medical doctor. Provide accurate, helpful, and safe advice about natural remedies.",
        },
        { role: "user", content: prompt },
      ],
      model: MODEL,
      temperature: 0.5,
      max_tokens: 600,
    });

    return completion.choices[0]?.message?.content || "Information not available. Please try again.";
  } catch (error) {
    console.error("AI Remedy Info Error:", error);
    
    return `**${remedyName}** is a traditional remedy that may help with your symptoms.

**General Guidelines:**
• Research proper preparation methods before use
• Start with small amounts to test your tolerance
• Consult a healthcare provider if you have existing conditions
• Stop use if you experience any adverse reactions

For detailed instructions, consider consulting a herbalist or naturopath.`;
  }
}