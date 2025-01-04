import { BaseAPI } from '../../../shared/api/BaseAPI';
import { EnvironmentInterface } from '../../../shared/interfaces/environment';
import { ApiResponse } from '../../../shared/interfaces/api';
import { createMockResponse } from '../../utils/testUtils';

interface TestResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class TestAPI extends BaseAPI<Response, RequestInit> {
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly rateLimitWindow = 100; // 100ms window for testing
  private readonly retryDelay = 50; // 50ms retry delay for testing
  private readonly maxRequestsPerMinute: number;
  private readonly maxRequestsPerHour: number;

  constructor(config: {
    baseUrl: string;
    maxRequestsPerMinute: number;
    maxRequestsPerHour: number;
    debug?: boolean;
    environment: EnvironmentInterface<Response, RequestInit>;
  }) {
    super(config);
    this.maxRequestsPerMinute = config.maxRequestsPerMinute;
    this.maxRequestsPerHour = config.maxRequestsPerHour;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async retryWithBackoff<U>(
    operation: () => Promise<U>,
    retries = 3,
    delay = this.retryDelay,
    backoff = 2
  ): Promise<U> {
    try {
      return await operation();
    } catch (error) {
      if (retries === 0) throw error;

      if (
        error instanceof Error &&
        error.message.includes('Rate limit exceeded')
      ) {
        await this.delay(this.rateLimitWindow);
        this.requestCount = 0;
      } else {
        await this.delay(delay);
      }

      return this.retryWithBackoff(
        operation,
        retries - 1,
        delay * backoff,
        backoff
      );
    }
  }

  async testFetchApi(path: string): Promise<TestResponse> {
    const operation = async () => {
      const now = Date.now();
      if (
        now - this.lastRequestTime < this.rateLimitWindow &&
        this.requestCount >= this.maxRequestsPerMinute
      ) {
        throw new Error('Rate limit exceeded');
      }

      this.requestCount++;
      this.lastRequestTime = now;

      // Create a mock response with rate limit headers
      const { hourly: remaining } =
        this.rateLimitService.getRemainingRequests();
      const mockResponse = createMockResponse(
        { success: true, data: { test: 'data' } },
        {
          rateLimit: {
            limit: this.maxRequestsPerHour.toString(),
            remaining: remaining.toString(),
            reset: this.rateLimitService.getNextAllowedTime().toString(),
          },
        }
      );

      // Mock the fetch call
      (this.environment as any).fetch = jest
        .fn()
        .mockResolvedValue(mockResponse);

      const response = await this.fetchApi<TestResponse>(path);
      if (!response.success) {
        throw new Error(response.error || 'Request failed');
      }
      return response;
    };

    return this.retryWithBackoff(operation);
  }
}
