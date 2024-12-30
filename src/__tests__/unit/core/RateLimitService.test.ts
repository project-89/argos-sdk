import { RateLimitService } from '../../../core/services/RateLimitService';

describe('RateLimitService', () => {
  let rateLimiter: RateLimitService;

  beforeEach(() => {
    rateLimiter = new RateLimitService({
      maxRequestsPerHour: 10,
      maxRequestsPerMinute: 5,
      debug: false,
    });
  });

  it('should allow requests within limits', () => {
    expect(rateLimiter.canMakeRequest()).toBe(true);
    rateLimiter.trackRequest();
    expect(rateLimiter.canMakeRequest()).toBe(true);
  });

  it('should block requests when minute limit is reached', () => {
    // Make 5 requests (minute limit)
    for (let i = 0; i < 5; i++) {
      expect(rateLimiter.canMakeRequest()).toBe(true);
      rateLimiter.trackRequest();
    }

    // Next request should be blocked
    expect(rateLimiter.canMakeRequest()).toBe(false);
  });

  it('should block requests when hourly limit is reached', () => {
    // Make 10 requests (hourly limit)
    for (let i = 0; i < 10; i++) {
      // Reset minute bucket to simulate requests spread over time
      (rateLimiter as any).minuteBucket.count = 0;
      expect(rateLimiter.canMakeRequest()).toBe(true);
      rateLimiter.trackRequest();
    }

    // Next request should be blocked
    expect(rateLimiter.canMakeRequest()).toBe(false);
  });

  it('should reset buckets after their time period', () => {
    // Fill up minute bucket
    for (let i = 0; i < 5; i++) {
      rateLimiter.trackRequest();
    }
    expect(rateLimiter.canMakeRequest()).toBe(false);

    // Simulate time passing (1 minute)
    const minuteBucket = (rateLimiter as any).minuteBucket;
    minuteBucket.resetTime = Date.now() - 1000; // Set reset time to the past

    // Should allow requests again
    expect(rateLimiter.canMakeRequest()).toBe(true);
  });

  it('should return correct remaining requests', () => {
    expect(rateLimiter.getRemainingRequests()).toEqual({
      hourly: 10,
      minute: 5,
    });

    // Make 2 requests
    rateLimiter.trackRequest();
    rateLimiter.trackRequest();

    expect(rateLimiter.getRemainingRequests()).toEqual({
      hourly: 8,
      minute: 3,
    });
  });

  it('should return correct next allowed time', () => {
    const now = Date.now();

    // Fill up minute bucket
    for (let i = 0; i < 5; i++) {
      rateLimiter.trackRequest();
    }

    const nextAllowed = rateLimiter.getNextAllowedTime();
    expect(nextAllowed).toBeGreaterThan(now);
    expect(nextAllowed - now).toBeLessThanOrEqual(60 * 1000); // Should be less than 1 minute
  });

  it('should handle rate limit resets correctly', () => {
    // Fill up minute bucket
    for (let i = 0; i < 5; i++) {
      rateLimiter.trackRequest();
    }
    expect(rateLimiter.canMakeRequest()).toBe(false);

    // Simulate time passing (1 minute)
    const minuteBucket = (rateLimiter as any).minuteBucket;
    minuteBucket.resetTime = Date.now() - 1000;

    // Should reset and allow new requests
    expect(rateLimiter.canMakeRequest()).toBe(true);
    expect(minuteBucket.count).toBe(0);
  });

  it('should maintain separate minute and hourly buckets', () => {
    // Fill minute bucket but keep under hourly limit
    for (let i = 0; i < 5; i++) {
      rateLimiter.trackRequest();
    }

    // Minute requests should be blocked
    expect(rateLimiter.canMakeRequest()).toBe(false);

    // Reset minute bucket
    const minuteBucket = (rateLimiter as any).minuteBucket;
    minuteBucket.resetTime = Date.now() - 1000;
    minuteBucket.count = 0;

    // Should allow more requests until hourly limit
    expect(rateLimiter.canMakeRequest()).toBe(true);
    for (let i = 0; i < 5; i++) {
      rateLimiter.trackRequest();
    }

    // Should hit hourly limit
    expect(rateLimiter.canMakeRequest()).toBe(false);
  });
});
