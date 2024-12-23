import { BaseAPI } from '../../api/BaseAPI';
import { createMockResponse } from '../utils/testUtils';

class TestAPI extends BaseAPI {
  public testFetch(
    endpoint: string,
    options: RequestInit & { isPublic?: boolean } = {}
  ) {
    return this.fetchApi(endpoint, options);
  }
}

describe('BaseAPI', () => {
  let api: TestAPI;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    api = new TestAPI({
      baseUrl: 'http://test.com',
      apiKey: 'test-key',
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Authentication', () => {
    it('should include API key for protected endpoints', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          body: { success: true, data: {} },
        })
      );

      await api.testFetch('/protected-endpoint', { method: 'GET' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test.com/protected-endpoint',
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-api-key': 'test-key',
          }),
        })
      );
    });

    it('should not include API key for public endpoints', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          body: { success: true, data: {} },
        })
      );

      await api.testFetch('/public-endpoint', {
        method: 'GET',
        isPublic: true,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test.com/public-endpoint',
        expect.not.objectContaining({
          headers: expect.objectContaining({
            'x-api-key': 'test-key',
          }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle rate limit errors', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: false,
          status: 429,
          body: {
            success: false,
            error: 'Rate limit exceeded',
            retryAfter: 60,
          },
        })
      );

      await expect(
        api.testFetch('/test-endpoint', { method: 'GET' })
      ).rejects.toThrow('Rate limit exceeded');
    });

    it('should include retryAfter in rate limit errors', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: false,
          status: 429,
          body: {
            success: false,
            error: 'Rate limit exceeded',
            retryAfter: 60,
          },
        })
      );

      try {
        await api.testFetch('/test-endpoint', { method: 'GET' });
      } catch (error: any) {
        expect(error.retryAfter).toBe(60);
      }
    });

    it('should handle general API errors', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          body: {
            success: false,
            error: 'Invalid request',
          },
        })
      );

      await expect(
        api.testFetch('/test-endpoint', { method: 'GET' })
      ).rejects.toThrow('Invalid request');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        api.testFetch('/test-endpoint', { method: 'GET' })
      ).rejects.toThrow('Network error');
    });
  });
});
