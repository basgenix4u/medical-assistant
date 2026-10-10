import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from "@/lib/auth/password";

describe("password", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("Str0ngPass");
    expect(hash).not.toBe("Str0ngPass");
    expect(hash.length).toBeGreaterThan(20);
    expect(await verifyPassword("Str0ngPass", hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("validates password strength", () => {
    expect(validatePasswordStrength("short").ok).toBe(false);
    expect(validatePasswordStrength("allletters").ok).toBe(false);
    expect(validatePasswordStrength("12345678").ok).toBe(false);
    expect(validatePasswordStrength("Str0ngPass").ok).toBe(true);
  });
});
