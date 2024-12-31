import { jest } from '@jest/globals';
import { TestAPI } from './TestAPI';
import { MockBrowserEnvironment } from '../../utils/testUtils';

type FetchFunction = (url: string, init?: RequestInit) => Promise<Response>;

describe('Request Handling Integration', () => {
  let api: TestAPI;
  let mockEnvironment: MockBrowserEnvironment;

  beforeEach(() => {
    jest.useFakeTimers();
    mockEnvironment = new MockBrowserEnvironment('test-fingerprint');
    api = new TestAPI({
      baseUrl: 'https://test.example.com',
      environment: mockEnvironment,
      maxRequestsPerMinute: 5,
      maxRequestsPerHour: 100,
      debug: true,
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  async function advanceTimeAndFlushPromises(ms: number) {
    jest.advanceTimersByTime(ms);
    await Promise.resolve(); // Flush microtasks once
  }

  describe('Rate Limiting and Queueing', () => {
    it('should queue requests when rate limit is reached and resume after delay', async () => {
      const requests = Array(7)
        .fill(null)
        .map(() => api.testFetchApi('/test'));
      const responses = await Promise.allSettled(requests);

      // First 5 should succeed
      for (let i = 0; i < 5; i++) {
        const result = responses[i];
        expect(result.status).toBe('fulfilled');
      }

      // Last 2 should be rejected due to rate limit
      for (let i = 5; i < 7; i++) {
        const result = responses[i];
        expect(result.status).toBe('rejected');
        if (result.status === 'rejected') {
          expect(result.reason.message).toContain('Rate limit exceeded');
        }
      }

      // Advance time by 1 minute to reset rate limit
      await advanceTimeAndFlushPromises(60 * 1000);

      // Retry the failed requests
      const retryResponses = await Promise.all(
        requests.slice(5).map(() => api.testFetchApi('/test'))
      );
      expect(retryResponses).toHaveLength(2);
      retryResponses.forEach((response) => {
        expect(response.success).toBe(true);
      });
    });

    it('should handle server rate limit responses (429)', async () => {
      let retryCount = 0;
      const mockFetch = jest
        .fn<FetchFunction>()
        .mockImplementation(async () => {
          if (retryCount === 0) {
            retryCount++;
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
      mockEnvironment.fetch = mockFetch;

      const responsePromise = api.testFetchApi('/test');

      // Advance time by retry delay
      await advanceTimeAndFlushPromises(1000);

      // Wait for the response
      const response = await responsePromise;

      expect(response.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle network errors with retries', async () => {
      let attempts = 0;
      const mockFetch = jest
        .fn<FetchFunction>()
        .mockImplementation(async () => {
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
      mockEnvironment.fetch = mockFetch;

      const responsePromise = api.testFetchApi('/test');

      // First retry (1 second delay)
      await advanceTimeAndFlushPromises(1000);

      // Second retry (2 seconds delay)
      await advanceTimeAndFlushPromises(2000);

      // Wait for the response
      const response = await responsePromise;

      expect(response.success).toBe(true);
      expect(attempts).toBe(3);
    });

    it('should handle server errors with exponential backoff', async () => {
      let attempts = 0;
      const mockFetch = jest
        .fn<FetchFunction>()
        .mockImplementation(async () => {
          attempts++;
          if (attempts < 3) {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Internal Server Error',
              }),
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
      mockEnvironment.fetch = mockFetch;

      const responsePromise = api.testFetchApi('/test');

      // First retry (1 second delay)
      await advanceTimeAndFlushPromises(1000);

      // Second retry (2 seconds delay)
      await advanceTimeAndFlushPromises(2000);

      // Wait for the response
      const response = await responsePromise;

      expect(response.success).toBe(true);
      expect(attempts).toBe(3);
    });
  });
});
