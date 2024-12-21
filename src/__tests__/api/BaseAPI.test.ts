import { jest } from '@jest/globals';
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
  let mockFetch: jest.MockedFunction<typeof fetch>;

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

      await api.testFetch('/api-key', { method: 'GET' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test.com/api-key',
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

      await api.testFetch('/fingerprint/register', {
        method: 'POST',
        isPublic: true,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test.com/fingerprint/register',
        expect.not.objectContaining({
          headers: expect.objectContaining({
            'x-api-key': expect.any(String),
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
            error: 'Too many requests, please try again later',
            retryAfter: 60,
          },
        })
      );

      await expect(
        api.testFetch('/api-key', { method: 'GET' })
      ).rejects.toThrow('Too many requests, please try again later');
    });

    it('should include retryAfter in rate limit errors', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: false,
          status: 429,
          body: {
            success: false,
            error: 'Too many requests, please try again later',
            retryAfter: 60,
          },
        })
      );

      try {
        await api.testFetch('/api-key', { method: 'GET' });
      } catch (error) {
        expect(error).toHaveProperty('retryAfter', 60);
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
            error: 'Bad Request',
          },
        })
      );

      await expect(
        api.testFetch('/api-key', { method: 'GET' })
      ).rejects.toThrow('Bad Request');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

      await expect(
        api.testFetch('/api-key', { method: 'GET' })
      ).rejects.toThrow(
        'Unable to connect to Argos API at http://test.com/api-key'
      );
    });
  });
});
