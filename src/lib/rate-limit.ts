// src/lib/rate-limit.ts
/**
 * Simple in-memory rate limiter. Sufficient for single-instance serverless
 * functions. For production at scale, replace with Upstash Redis or similar.
 */

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
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "anonymous";
}
