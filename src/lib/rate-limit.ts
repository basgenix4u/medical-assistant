// src/lib/rate-limit.ts
/**
 * Rate limiting (gap G8/G12).
 *
 * In-memory fixed-window limiter — sufficient for single-instance serverless
 * functions. For multi-instance production, swap in a Redis/Upstash-backed
 * implementation of the same RateLimiter interface.
 *
 * Client IP extraction only trusts proxy headers (x-forwarded-for /
 * x-real-ip) when TRUST_PROXY=1 is set (i.e. behind a trusted reverse proxy
 * such as Vercel or nginx). Otherwise those headers are ignored, so clients
 * cannot spoof their way past limits.
 */
import { trustProxy } from "@/lib/env";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitConfig {
  /** Unique key, e.g. "analyze:1.2.3.4" */
  key: string;
  /** Max requests allowed in window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export interface RateLimiter {
  check(cfg: RateLimitConfig): RateLimitResult;
}

/**
 * Returns { allowed, remaining, resetAt }. When allowed=false the caller
 * should respond with HTTP 429.
 */
export function rateLimit(cfg: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(cfg.key);

  if (!bucket || bucket.resetAt < now) {
    const resetAt = now + cfg.windowMs;
    buckets.set(cfg.key, { count: 1, resetAt });
    // Periodic cleanup
    if (buckets.size > 5000) {
      for (const [k, b] of buckets.entries()) {
        if (b.resetAt < now) buckets.delete(k);
      }
    }
    return { allowed: true, remaining: cfg.limit - 1, resetAt };
  }

  if (bucket.count >= cfg.limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: cfg.limit - bucket.count,
    resetAt: bucket.resetAt,
  };
}

/**
 * Extracts the best client IP for rate limiting purposes.
 * Proxy headers are honored only when TRUST_PROXY=1.
 */
export function getClientIp(request: Request): string {
  if (trustProxy) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) return forwardedFor.split(",")[0].trim();
    const realIp = request.headers.get("x-real-ip");
    if (realIp) return realIp;
  }
  return "anonymous";
}
