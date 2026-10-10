import { describe, it, expect } from "vitest";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

describe("rate limiter", () => {
  it("allows up to the limit, then blocks", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      expect(rateLimit({ key, limit: 5, windowMs: 60_000 }).allowed).toBe(true);
    }
    const blocked = rateLimit({ key, limit: 5, windowMs: 60_000 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetAt).toBeGreaterThan(Date.now());
  });

  it("tracks keys independently", () => {
    const k1 = `a-${Math.random()}`;
    const k2 = `b-${Math.random()}`;
    rateLimit({ key: k1, limit: 1, windowMs: 60_000 });
    expect(rateLimit({ key: k1, limit: 1, windowMs: 60_000 }).allowed).toBe(false);
    expect(rateLimit({ key: k2, limit: 1, windowMs: 60_000 }).allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("ignores proxy headers when TRUST_PROXY is not set", () => {
    const req = new Request("http://localhost/api", {
      headers: { "x-forwarded-for": "1.2.3.4" },
    });
    // Without TRUST_PROXY=1 the spoofable header must be ignored.
    expect(getClientIp(req)).toBe("anonymous");
  });
});
