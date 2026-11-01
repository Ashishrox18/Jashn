import { checkRateLimit, resetRateLimits } from '@/lib/rateLimit';

describe('Rate Limiter', () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it('allows up to 10 requests within a 1-minute window', () => {
    const key = 'user1:127.0.0.1';
    for (let i = 0; i < 10; i++) {
      const res = checkRateLimit(key);
      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(9 - i);
    }

    // 11th request blocked
    const blocked = checkRateLimit(key);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('tracks distinct rate limit keys separately', () => {
    const keyA = 'userA:127.0.0.1';
    const keyB = 'userB:127.0.0.1';

    for (let i = 0; i < 10; i++) {
      checkRateLimit(keyA);
    }
    expect(checkRateLimit(keyA).allowed).toBe(false);

    // keyB is unaffected
    expect(checkRateLimit(keyB).allowed).toBe(true);
  });
});
