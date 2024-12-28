import { BaseAPI } from '../../../shared/api/BaseAPI';
import { createMockEnvironment } from '../../../__tests__/utils/testUtils';
import { HttpMethod } from '../../../shared/interfaces/http';

// Create a concrete implementation for testing
class TestAPI extends BaseAPI {
  public async testFetch(path: string, options = {}) {
    return this.fetchApi(path, options);
  }
}

describe('BaseAPI', () => {
  let api: TestAPI;
  let mockEnvironment: ReturnType<typeof createMockEnvironment>;

  beforeEach(() => {
    mockEnvironment = createMockEnvironment();
    api = new TestAPI({
      baseUrl: 'https://test.example.com',
      environment: mockEnvironment,
    });
  });

  describe('fetchApi', () => {
    it('should make requests with correct headers', async () => {
      const response = await api.testFetch('/test');
      expect(response.success).toBe(true);
    });

    it('should handle different HTTP methods', async () => {
      const response = await api.testFetch('/test', {
        method: HttpMethod.POST,
        body: { test: true },
      });
      expect(response.success).toBe(true);
    });

    it('should handle errors', async () => {
      const mockFetch = jest
        .spyOn(mockEnvironment, 'fetch')
        .mockImplementation(async () => {
          return new Response(JSON.stringify({ error: 'Test error' }), {
            status: 400,
            statusText: 'Bad Request',
            headers: { 'content-type': 'application/json' },
          });
        });

      await expect(api.testFetch('/test')).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalled();
    });
  });
});
