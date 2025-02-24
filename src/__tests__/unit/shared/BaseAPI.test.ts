import { jest } from '@jest/globals';
import { BaseAPI } from '../../../shared/api/BaseAPI';
import { HttpMethod } from '../../../shared/interfaces/http';
import { TestEnvironment } from './mocks/TestEnvironment';
import type { BaseAPIRequestOptions } from '../../../shared/api/BaseAPI';
import type { ApiResponse } from '../../../shared/interfaces/api';

const BASE_URL = 'https://test.example.com';
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

class TestAPI extends BaseAPI<Response, RequestInit> {
  constructor() {
    super({
      baseUrl: BASE_URL,
      environment: new TestEnvironment(),
      maxRequestsPerMinute: 1000,
      maxRequestsPerHour: 1000,
    });
  }

  async testFetch<T>(
    path: string,
    options?: BaseAPIRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.fetchApi<T>(path, options);
  }
}

describe('BaseAPI', () => {
  let api: TestAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    api = new TestAPI();

    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
          'x-ratelimit-limit': '1000',
          'x-ratelimit-remaining': '999',
          'x-ratelimit-reset': Date.now().toString(),
        }),
        json: () => Promise.resolve({ success: true, data: { test: 'data' } }),
      } as Response)
    );
  });

  it('should call fetch with correct parameters', async () => {
    const testData = { test: 'data' };
    await api.testFetch('/test', {
      method: HttpMethod.POST,
      body: JSON.stringify(testData),
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/test`, {
      method: HttpMethod.POST,
      body: JSON.stringify(testData),
      headers: {
        'content-type': 'application/json',
        'user-agent': 'test-fingerprint',
      },
    });
  });

  it('should handle API errors', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        headers: new Headers({
          'content-type': 'application/json',
          'x-ratelimit-limit': '1000',
          'x-ratelimit-remaining': '999',
          'x-ratelimit-reset': Date.now().toString(),
        }),
        json: () => Promise.resolve({ success: false, error: 'Test error' }),
      } as Response)
    );

    await expect(
      api.testFetch('/test', {
        method: HttpMethod.POST,
        body: JSON.stringify({ test: 'data' }),
      })
    ).rejects.toThrow();
  });

  it('should handle request cancellation', async () => {
    const controller = new AbortController();

    mockFetch.mockImplementationOnce(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        // Check if the request has been aborted
        if (init?.signal?.aborted) {
          const error = new Error('AbortError');
          error.name = 'AbortError';
          throw error;
        }

        // Simulate some async work
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Check again in case it was aborted during the async work
        if (init?.signal?.aborted) {
          const error = new Error('AbortError');
          error.name = 'AbortError';
          throw error;
        }

        return {
          ok: true,
          headers: new Headers({
            'content-type': 'application/json',
            'x-ratelimit-limit': '1000',
            'x-ratelimit-remaining': '999',
            'x-ratelimit-reset': Date.now().toString(),
          }),
          json: () =>
            Promise.resolve({ success: true, data: { test: 'data' } }),
        } as Response;
      }
    );

    const fetchPromise = api.testFetch('/test', {
      method: HttpMethod.GET,
      signal: controller.signal,
    });

    // Cancel the request
    controller.abort();

    await expect(fetchPromise).rejects.toThrow('Request was cancelled');
  });

  describe('Rate Limiting', () => {
    it('should include rate limit information when headers are present', async () => {
      const now = Date.now();
      mockFetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          headers: new Headers({
            'content-type': 'application/json',
            'x-ratelimit-limit': '1000',
            'x-ratelimit-remaining': '999',
            'x-ratelimit-reset': now.toString(),
          }),
          json: () =>
            Promise.resolve({
              success: true,
              data: { test: 'data' },
            }),
        } as Response)
      );

      const response = await api.testFetch('/test');

      expect(response).toHaveProperty('rateLimitInfo');
      expect(response.rateLimitInfo).toEqual({
        limit: '1000',
        remaining: '999',
        reset: now.toString(),
      });
    });

    it('should track request counts when rate limits are present', async () => {
      let remainingRequests = 1000;

      mockFetch.mockImplementation(() => {
        const headers = new Headers({
          'content-type': 'application/json',
          'x-ratelimit-limit': '1000',
          'x-ratelimit-remaining': (--remainingRequests).toString(),
          'x-ratelimit-reset': Date.now().toString(),
        });

        return Promise.resolve({
          ok: true,
          status: 200,
          headers,
          json: () =>
            Promise.resolve({
              success: true,
              data: { test: 'data' },
            }),
        } as Response);
      });

      await api.testFetch('/test');
      await api.testFetch('/test');
      const thirdResponse = await api.testFetch('/test');

      expect(thirdResponse.rateLimitInfo?.remaining).toBe('997');
    });

    it('should handle rate limit reset windows', async () => {
      jest.useFakeTimers();
      const now = Date.now();

      mockFetch.mockImplementationOnce(() => {
        const headers = new Headers({
          'content-type': 'application/json',
          'x-ratelimit-limit': '1000',
          'x-ratelimit-remaining': '999',
          'x-ratelimit-reset': now.toString(),
        });

        return Promise.resolve({
          ok: true,
          status: 200,
          headers,
          json: () =>
            Promise.resolve({
              success: true,
              data: { test: 'data' },
            }),
        } as Response);
      });

      const response = await api.testFetch('/test');
      expect(response.rateLimitInfo?.remaining).toBe('999');

      jest.useRealTimers();
    });
  });
});
