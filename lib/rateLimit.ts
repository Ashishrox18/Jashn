interface RateLimitRecord {
  count: number;
  resetAtMs: number;
}

const windowMs = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 10;
const storage = new Map<string, RateLimitRecord>();

/**
 * In-memory sliding window rate limiter keyed on userId + client IP.
 * Allows up to 10 requests per minute.
 */
export function checkRateLimit(key: string): {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
} {
  const now = Date.now();
  const record = storage.get(key);

  // Periodic cleanup if map grows
  if (storage.size > 1000) {
    for (const [k, v] of storage.entries()) {
      if (now > v.resetAtMs) {
        storage.delete(k);
      }
    }
  }

  if (!record || now > record.resetAtMs) {
    storage.set(key, { count: 1, resetAtMs: now + windowMs });
    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: maxRequestsPerWindow - 1,
    };
  }

  if (record.count >= maxRequestsPerWindow) {
    const retryAfter = Math.max(1, Math.ceil((record.resetAtMs - now) / 1000));
    return {
      allowed: false,
      retryAfterSeconds: retryAfter,
      remaining: 0,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: maxRequestsPerWindow - record.count,
  };
}

/**
 * Resets rate limiter state (useful for tests)
 */
export function resetRateLimits(): void {
  storage.clear();
}
