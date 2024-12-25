import { BaseAPI } from '../../api/BaseAPI';
import {
  createMockResponse,
  isIntegrationTest,
  INTEGRATION_API_URL,
  INTEGRATION_API_KEY,
  MockEnvironment,
  MockStorage,
} from '../utils/testUtils';

class TestAPI extends BaseAPI {
  public testFetch<T>(endpoint: string, options: RequestInit = {}) {
    return this.fetchApi<T>(endpoint, options);
  }
}

describe('BaseAPI', () => {
  let api: TestAPI;
  let mockFetch: jest.Mock;
  let mockEnvironment: MockEnvironment;
  let mockStorage: MockStorage;

  beforeEach(() => {
    if (!isIntegrationTest()) {
      mockFetch = jest.fn();
      global.fetch = mockFetch;
    }

    mockEnvironment = new MockEnvironment();
    mockStorage = new MockStorage();

    api = new TestAPI({
      baseUrl: isIntegrationTest() ? INTEGRATION_API_URL : 'http://test.com',
      apiKey: isIntegrationTest() ? INTEGRATION_API_KEY : 'test-key',
      environment: mockEnvironment,
      storage: mockStorage,
    });
  });

  afterEach(() => {
    if (!isIntegrationTest()) {
      jest.resetAllMocks();
    }
  });

  (isIntegrationTest() ? describe.skip : describe)('Unit Tests', () => {
    describe('Authentication', () => {
      it('should include API key in headers', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockResponse({
            body: { success: true, data: {} },
          })
        );

        await api.testFetch('/test-endpoint', { method: 'GET' });

        expect(mockFetch).toHaveBeenCalledWith(
          'http://test.com/test-endpoint',
          expect.objectContaining({
            headers: expect.any(Headers),
          })
        );

        const headers = mockFetch.mock.calls[0][1].headers;
        expect(headers.get('X-API-Key')).toBe('test-key');
      });

      it('should include environment headers', async () => {
        mockFetch.mockResolvedValueOnce(
          createMockResponse({
            body: { success: true, data: {} },
          })
        );

        await api.testFetch('/test-endpoint', { method: 'GET' });

        const headers = mockFetch.mock.calls[0][1].headers;
        expect(headers.get('User-Agent')).toBe('test-user-agent');
      });
    });

    describe('Error Handling', () => {
      it('should handle API errors', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            message: 'Invalid request',
          }),
        });

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

  (isIntegrationTest() ? describe : describe.skip)('Integration Tests', () => {
    it('should make successful request to health endpoint', async () => {
      const response = await api.testFetch('/health', {
        method: 'GET',
      });
      expect(response).toBeDefined();
    });

    it('should handle protected endpoint with valid API key', async () => {
      const response = await api.testFetch('/fingerprint/register', {
        method: 'POST',
        body: JSON.stringify({ fingerprint: 'test-fingerprint' }),
      });
      expect(response).toBeDefined();
    });

    it('should reject protected endpoint with invalid API key', async () => {
      const invalidApi = new TestAPI({
        baseUrl: INTEGRATION_API_URL,
        apiKey: 'invalid-key',
        environment: mockEnvironment,
        storage: mockStorage,
      });

      await expect(
        invalidApi.testFetch('/api-key/list', {
          method: 'GET',
        })
      ).rejects.toThrow();
    });
  });
});
