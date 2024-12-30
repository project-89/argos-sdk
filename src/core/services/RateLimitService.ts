import { log } from '../../shared/utils/logger';

export interface RateLimitConfig {
  maxRequestsPerHour: number;
  maxRequestsPerMinute: number;
  debug?: boolean;
}

interface RateLimitBucket {
  count: number;
  resetTime: number;
}

export class RateLimitService {
  private hourlyBucket: RateLimitBucket;
  private minuteBucket: RateLimitBucket;
  private maxRequestsPerHour: number;
  private maxRequestsPerMinute: number;
  private debug: boolean;

  constructor(config: RateLimitConfig) {
    this.maxRequestsPerHour = config.maxRequestsPerHour;
    this.maxRequestsPerMinute = config.maxRequestsPerMinute;
    this.debug = config.debug || false;

    // Initialize buckets
    const now = Date.now();
    this.hourlyBucket = {
      count: 0,
      resetTime: now + 60 * 60 * 1000, // 1 hour
    };
    this.minuteBucket = {
      count: 0,
      resetTime: now + 60 * 1000, // 1 minute
    };
  }

  private resetBucketIfNeeded(bucket: RateLimitBucket): void {
    const now = Date.now();
    if (now >= bucket.resetTime) {
      bucket.count = 0;
      bucket.resetTime =
        now + (bucket === this.hourlyBucket ? 60 * 60 * 1000 : 60 * 1000);
      log(this.debug, 'Rate limit bucket reset:', {
        type: bucket === this.hourlyBucket ? 'hourly' : 'minute',
        resetTime: new Date(bucket.resetTime).toISOString(),
      });
    }
  }

  canMakeRequest(): boolean {
    this.resetBucketIfNeeded(this.hourlyBucket);
    this.resetBucketIfNeeded(this.minuteBucket);

    const canMakeHourlyRequest =
      this.hourlyBucket.count < this.maxRequestsPerHour;
    const canMakeMinuteRequest =
      this.minuteBucket.count < this.maxRequestsPerMinute;

    log(this.debug, 'Rate limit check:', {
      hourlyCount: this.hourlyBucket.count,
      minuteCount: this.minuteBucket.count,
      canMakeHourlyRequest,
      canMakeMinuteRequest,
    });

    return canMakeHourlyRequest && canMakeMinuteRequest;
  }

  trackRequest(): void {
    this.hourlyBucket.count++;
    this.minuteBucket.count++;

    log(this.debug, 'Request tracked:', {
      hourlyCount: this.hourlyBucket.count,
      minuteCount: this.minuteBucket.count,
    });
  }

  getNextAllowedTime(): number {
    this.resetBucketIfNeeded(this.hourlyBucket);
    this.resetBucketIfNeeded(this.minuteBucket);

    if (this.canMakeRequest()) {
      return Date.now();
    }

    // Return the earliest time when a request will be allowed
    return Math.min(this.hourlyBucket.resetTime, this.minuteBucket.resetTime);
  }

  getRemainingRequests(): { hourly: number; minute: number } {
    this.resetBucketIfNeeded(this.hourlyBucket);
    this.resetBucketIfNeeded(this.minuteBucket);

    return {
      hourly: Math.max(0, this.maxRequestsPerHour - this.hourlyBucket.count),
      minute: Math.max(0, this.maxRequestsPerMinute - this.minuteBucket.count),
    };
  }
}
