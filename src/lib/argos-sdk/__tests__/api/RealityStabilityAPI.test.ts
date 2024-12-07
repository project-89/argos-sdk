import { RealityStabilityAPI } from '../../api/RealityStabilityAPI';
import { mockFetch, mockApiKey, mockHeaders } from '../utils/testUtils';

describe('RealityStabilityAPI', () => {
  let api: RealityStabilityAPI;
  const baseUrl = 'http://localhost:5001';

  beforeEach(() => {
    api = new RealityStabilityAPI(baseUrl, mockApiKey);
    global.fetch = jest.fn();
  });

  describe('getIndex', () => {
    it('should get reality stability index', async () => {
      const mockResponse = {
        success: true,
        data: {
          stabilityIndex: 85.5,
          currentPrice: 100.0,
          priceChange: -2.5,
          timestamp: Date.now(),
        },
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.getIndex();

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/reality-stability`,
        expect.objectContaining({
          method: 'GET',
          headers: mockHeaders,
        })
      );

      expect(result).toEqual(mockResponse.data);
      expect(result.stabilityIndex).toBeDefined();
      expect(result.currentPrice).toBeDefined();
      expect(result.priceChange).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should handle service errors', async () => {
      const mockError = {
        success: false,
        error: 'Failed to calculate reality stability index',
      };

      mockFetch(global.fetch as jest.Mock, mockError, 500);

      await expect(api.getIndex()).rejects.toThrow(
        'Failed to calculate reality stability index'
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(api.getIndex()).rejects.toThrow(
        'Failed to get reality stability index: Network error'
      );
    });

    it('should handle malformed responses', async () => {
      const mockResponse = {
        success: true,
        data: {
          // Missing required fields
          timestamp: Date.now(),
        },
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.getIndex();
      expect(result.timestamp).toBeDefined();
      expect(result.stabilityIndex).toBeUndefined();
      expect(result.currentPrice).toBeUndefined();
      expect(result.priceChange).toBeUndefined();
    });
  });
});
