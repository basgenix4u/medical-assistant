import { describe, it, expect } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/auth/jwt";

describe("jwt", () => {
  it("issues a session token with a unique jti and verifies it", async () => {
    const a = await createSessionToken("user-1", "a@example.com");
    const b = await createSessionToken("user-1", "a@example.com");
    expect(a.jti).not.toBe(b.jti);

    const payload = await verifySessionToken(a.token);
    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe("user-1");
    expect(payload?.email).toBe("a@example.com");
    expect(payload?.jti).toBe(a.jti);
    expect(payload?.exp).toBeGreaterThan(payload?.iat ?? 0);
  });

  it("rejects tampered or malformed tokens", async () => {
    const { token } = await createSessionToken("user-1", "a@example.com");
    expect(await verifySessionToken(token + "x")).toBeNull();
    expect(await verifySessionToken("garbage")).toBeNull();
    expect(await verifySessionToken("")).toBeNull();
  });
});
