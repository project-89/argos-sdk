import { DebugAPI } from '../../api/DebugAPI';
import { mockFetch, mockApiKey, mockHeaders } from '../utils/testUtils';

describe('DebugAPI', () => {
  let api: DebugAPI;
  const baseUrl = 'http://localhost:5001';

  beforeEach(() => {
    api = new DebugAPI(baseUrl, mockApiKey);
    global.fetch = jest.fn();
  });

  describe('cleanup', () => {
    it('should perform cleanup operation', async () => {
      const mockResponse = {
        success: true,
        data: {
          cleanupTime: Date.now(),
          itemsCleaned: {
            visits: 10,
            presence: 5,
            priceCache: 15,
            rateLimitStats: 8,
            rateLimitRequests: 12,
          },
        },
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.cleanup();

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/debug/cleanup`,
        expect.objectContaining({
          method: 'POST',
          headers: mockHeaders,
        })
      );

      expect(result).toEqual(mockResponse.data);
      expect(result.cleanupTime).toBeDefined();
      expect(result.itemsCleaned).toBeDefined();
      expect(result.itemsCleaned.visits).toBeDefined();
      expect(result.itemsCleaned.presence).toBeDefined();
      expect(result.itemsCleaned.priceCache).toBeDefined();
      expect(result.itemsCleaned.rateLimitStats).toBeDefined();
      expect(result.itemsCleaned.rateLimitRequests).toBeDefined();
    });

    it('should handle cleanup errors', async () => {
      const mockError = {
        success: false,
        error: 'Simulated error for testing',
      };

      mockFetch(global.fetch as jest.Mock, mockError, 500);

      await expect(api.cleanup()).rejects.toThrow(
        'Simulated error for testing'
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(api.cleanup()).rejects.toThrow(
        'Failed to perform cleanup: Network error'
      );
    });

    it('should handle malformed responses', async () => {
      const mockResponse = {
        success: true,
        data: {
          // Missing required fields
          cleanupTime: Date.now(),
        },
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.cleanup();
      expect(result.cleanupTime).toBeDefined();
      expect(result.itemsCleaned).toBeUndefined();
    });
  });
});
