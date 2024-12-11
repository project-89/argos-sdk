import { jest } from '@jest/globals';
import { BaseAPI } from '../../api/BaseAPI';
import { createMockFetch, createMockResponse } from '../utils/testUtils';

// Mock the Response class since it's not available in Node
global.Response = jest.fn() as any;

class TestAPI extends BaseAPI {
  public testFetch(endpoint: string, options: RequestInit = {}) {
    return this.fetchApi(endpoint, options);
  }
}

describe('BaseAPI', () => {
  let mockFetch: ReturnType<typeof createMockFetch>;
  let api: TestAPI;

  beforeEach(() => {
    mockFetch = createMockFetch();
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
    it('should include API key for protected endpoints when provided', async () => {
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
            'Content-Type': 'application/json',
            'X-API-Key': 'test-key',
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

      await api.testFetch('/fingerprint', { method: 'POST' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test.com/fingerprint',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test.com/fingerprint',
        expect.not.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': expect.any(String),
          }),
        })
      );
    });

    it('should throw error for protected endpoints without API key', async () => {
      api = new TestAPI({
        baseUrl: 'http://test.com',
      });

      await expect(
        api.testFetch('/api-key', { method: 'GET' })
      ).rejects.toThrow('API key required for this operation');
    });
  });

  describe('Error Handling', () => {
    it('should handle rate limit errors', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: false,
          status: 429,
          headers: { 'Retry-After': '60' },
          body: { error: 'Rate limit exceeded' },
        })
      );

      await expect(
        api.testFetch('/api-key', { method: 'GET' })
      ).rejects.toThrow('Rate limit exceeded. Try again in 60 seconds');
    });

    it('should handle general API errors', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          body: { error: 'Bad Request' },
        })
      );

      await expect(
        api.testFetch('/api-key', { method: 'GET' })
      ).rejects.toThrow('Bad Request');
    });
  });
});
