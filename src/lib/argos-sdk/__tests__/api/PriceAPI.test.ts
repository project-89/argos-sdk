import { PriceAPI } from '../../api/PriceAPI';
import { mockFetch, mockApiKey, mockHeaders } from '../utils/testUtils';

describe('PriceAPI', () => {
  let api: PriceAPI;
  const baseUrl = 'http://localhost:5001';

  beforeEach(() => {
    api = new PriceAPI(baseUrl, mockApiKey);
    global.fetch = jest.fn();
  });

  describe('getCurrent', () => {
    it('should get current prices for default tokens', async () => {
      const mockResponse = {
        success: true,
        data: {
          Project89: {
            usd: 0.15,
            usd_24h_change: 2.5,
          },
        },
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.getCurrent();

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/price/current`,
        expect.objectContaining({
          method: 'GET',
          headers: mockHeaders,
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should get prices for specified tokens', async () => {
      const symbols = ['Project89', 'OtherToken'];
      const mockResponse = {
        success: true,
        data: {
          Project89: {
            usd: 0.15,
            usd_24h_change: 2.5,
          },
          OtherToken: {
            usd: 1.0,
            usd_24h_change: -1.2,
          },
        },
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.getCurrent(symbols);

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/price/current?symbols=${symbols.join(',')}`,
        expect.objectContaining({
          method: 'GET',
          headers: mockHeaders,
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle invalid tokens', async () => {
      const mockError = {
        success: false,
        error: 'No price data found for invalid-token',
      };

      mockFetch(global.fetch as jest.Mock, mockError, 404);

      await expect(api.getCurrent(['invalid-token'])).rejects.toThrow(
        'No price data found for invalid-token'
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(api.getCurrent()).rejects.toThrow(
        'Failed to fetch current prices: Network error'
      );
    });
  });

  describe('getHistory', () => {
    it('should get price history for a token', async () => {
      const tokenId = 'Project89';
      const mockResponse = {
        success: true,
        data: [
          {
            timestamp: new Date().getTime(),
            price: 0.15,
          },
          {
            timestamp: new Date().getTime() - 86400000,
            price: 0.14,
          },
        ],
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.getHistory(tokenId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/price/history/${tokenId}`,
        expect.objectContaining({
          method: 'GET',
          headers: mockHeaders,
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle invalid token', async () => {
      const mockError = {
        success: false,
        error: 'Token not found',
      };

      mockFetch(global.fetch as jest.Mock, mockError, 404);

      await expect(api.getHistory('invalid-token')).rejects.toThrow(
        'Token not found'
      );
    });

    it('should handle empty history', async () => {
      const mockResponse = {
        success: true,
        data: [],
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.getHistory('Project89');
      expect(result).toEqual([]);
    });

    it('should handle malformed responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(api.getHistory('Project89')).rejects.toThrow(
        'Failed to parse price history'
      );
    });
  });
});
