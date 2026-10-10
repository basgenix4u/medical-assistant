import { describe, it, expect } from "vitest";
import { detectEmergency, buildEmergencyResponse } from "@/lib/emergency";

describe("emergency detection", () => {
  it("detects emergency keywords", () => {
    expect(detectEmergency("I have chest pain")).toBe(true);
    expect(detectEmergency("I can't breathe")).toBe(true);
    expect(detectEmergency("I feel suicidal")).toBe(true);
    expect(detectEmergency("My throat closing up")).toBe(true);
  });

  it("detects emergency-service references", () => {
    expect(detectEmergency("I need an ambulance")).toBe(true);
    expect(detectEmergency("call 911")).toBe(true);
  });

  it("ignores non-emergency text", () => {
    expect(detectEmergency("I have a mild headache")).toBe(false);
    expect(detectEmergency("stomach ache after lunch")).toBe(false);
    expect(detectEmergency("")).toBe(false);
  });

  it("builds a safe emergency response", () => {
    const r = buildEmergencyResponse();
    expect(r.severity).toBe("emergency");
    expect(r.isEmergency).toBe(true);
    expect(r.emergencyMessage).toContain("911");
  });
});
