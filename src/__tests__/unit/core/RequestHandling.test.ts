import { jest } from '@jest/globals';
import { TestAPI } from './TestAPI';
import { MockBrowserEnvironment } from '../../utils/testUtils';

jest.setTimeout(5000); // Reduce timeout to 5 seconds

describe('Request Handling Integration', () => {
  let api: TestAPI;
  let mockEnvironment: MockBrowserEnvironment;
  let requestCount = 0;

  beforeEach(() => {
    jest.useFakeTimers({ advanceTimers: true });
    requestCount = 0;
    mockEnvironment = new MockBrowserEnvironment('test-fingerprint');
    api = new TestAPI({
      baseUrl: 'https://test.example.com',
      maxRequestsPerMinute: 5,
      maxRequestsPerHour: 100,
      debug: true,
      environment: mockEnvironment,
    });

    // Set up mock fetch that enforces rate limits
    mockEnvironment.fetch = jest.fn(async (url: string, init?: RequestInit) => {
      requestCount++;
      if (requestCount > 5) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded' }),
          {
            status: 429,
            headers: {
              'content-type': 'application/json',
              'retry-after': '1',
            },
          }
        );
      }
      return new Response(
        JSON.stringify({ success: true, data: { test: true } }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      );
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  async function advanceTimeAndFlushPromises(ms: number) {
    // Run all pending promises before advancing time
    await Promise.resolve();
    jest.advanceTimersByTime(ms);
    // Run all pending promises after advancing time
    await Promise.resolve();
  }

  describe('Rate Limiting and Queueing', () => {
    it('should queue requests when rate limit is reached and resume after delay', async () => {
      // Make 5 successful requests
      const successfulRequests = Array(5)
        .fill(null)
        .map(() => api.testFetchApi('/test'));

      const successfulResponses = await Promise.all(successfulRequests);
      successfulResponses.forEach((response) => {
        expect(response.success).toBe(true);
      });

      // Make 2 more requests that should be rate limited
      const rateLimitedRequests = Array(2)
        .fill(null)
        .map(() => api.testFetchApi('/test'));

      await expect(rateLimitedRequests[0]).rejects.toThrow(
        'Rate limit exceeded'
      );
      await expect(rateLimitedRequests[1]).rejects.toThrow(
        'Rate limit exceeded'
      );

      // Reset request count and advance time
      requestCount = 0;
      await advanceTimeAndFlushPromises(100); // 100ms window

      // Retry the failed requests
      const retryResponses = await Promise.all([
        api.testFetchApi('/test'),
        api.testFetchApi('/test'),
      ]);

      retryResponses.forEach((response) => {
        expect(response.success).toBe(true);
      });
    });

    it('should handle server rate limit responses (429)', async () => {
      let attempts = 0;
      mockEnvironment.fetch = jest.fn(async () => {
        attempts++;
        if (attempts === 1) {
          return new Response(
            JSON.stringify({ success: false, error: 'Too Many Requests' }),
            {
              status: 429,
              headers: {
                'content-type': 'application/json',
                'retry-after': '1',
              },
            }
          );
        }
        return new Response(
          JSON.stringify({ success: true, data: { test: true } }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }
        );
      });

      const responsePromise = api.testFetchApi('/test');
      await advanceTimeAndFlushPromises(50); // 50ms retry delay
      const response = await responsePromise;

      expect(response.success).toBe(true);
      expect(attempts).toBe(2);
    });

    it('should handle network errors with retries', async () => {
      let attempts = 0;
      mockEnvironment.fetch = jest.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('NetworkError');
        }
        return new Response(
          JSON.stringify({ success: true, data: { test: true } }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }
        );
      });

      const responsePromise = api.testFetchApi('/test');
      await advanceTimeAndFlushPromises(50); // First retry
      await advanceTimeAndFlushPromises(100); // Second retry
      const response = await responsePromise;

      expect(response.success).toBe(true);
      expect(attempts).toBe(3);
    });

    it('should handle server errors with exponential backoff', async () => {
      let attempts = 0;
      mockEnvironment.fetch = jest.fn(async () => {
        attempts++;
        if (attempts < 3) {
          return new Response(
            JSON.stringify({ success: false, error: 'Internal Server Error' }),
            {
              status: 500,
              headers: { 'content-type': 'application/json' },
            }
          );
        }
        return new Response(
          JSON.stringify({ success: true, data: { test: true } }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }
        );
      });

      const responsePromise = api.testFetchApi('/test');
      await advanceTimeAndFlushPromises(50); // First retry
      await advanceTimeAndFlushPromises(100); // Second retry
      const response = await responsePromise;

      expect(response.success).toBe(true);
      expect(attempts).toBe(3);
    });
  });
});
