import { describe, it, expect } from "vitest";
import { preprocessAnalysisInput, analyzeSymptoms, chatWithAI } from "@/lib/ai";

describe("AI input preprocessing", () => {
  it("sanitizes symptoms and description", () => {
    const out = preprocessAnalysisInput({
      symptoms: ["  Headache  ", "bad\x00symptom"],
      description: "pain\x07 behind eyes".repeat(500),
      duration: "2 days",
      severity: 99,
    });
    expect(out).not.toBeNull();
    expect(out?.symptoms).toEqual(["Headache", "badsymptom"]);
    expect((out?.description ?? "").length).toBeLessThanOrEqual(2000);
    expect(out?.severity).toBe(10); // clamped
  });

  it("rejects empty symptom lists", () => {
    expect(
      preprocessAnalysisInput({ symptoms: [], description: "x", duration: "1d", severity: 5 })
    ).toBeNull();
    expect(
      preprocessAnalysisInput({
        symptoms: "not-an-array" as unknown as string[],
        description: "x",
        duration: "1d",
        severity: 5,
      })
    ).toBeNull();
  });

  it("defaults severity when invalid", () => {
    const out = preprocessAnalysisInput({
      symptoms: ["cough"],
      description: "",
      duration: "",
      severity: Number.NaN,
    });
    expect(out?.severity).toBe(5);
  });
});

describe("AI safety guardrails (no provider calls)", () => {
  it("short-circuits emergency symptom analysis without calling the LLM", async () => {
    const result = await analyzeSymptoms({
      symptoms: ["chest pain"],
      description: "severe crushing chest pain",
      duration: "1 hour",
      severity: 9,
    });
    expect(result.isEmergency).toBe(true);
    expect(result.severity).toBe("emergency");
    expect(result.emergencyMessage).toContain("911");
  });

  it("short-circuits emergency chat messages without calling the LLM", async () => {
    const reply = await chatWithAI([
      { role: "user", content: "I have chest pain and can't breathe" },
    ]);
    expect(reply).toContain("emergency");
  });

  it("rejects oversized chat input without calling the LLM", async () => {
    const reply = await chatWithAI([{ role: "user", content: "" }]);
    expect(reply).toContain("exceeded our limits");
  });
});
