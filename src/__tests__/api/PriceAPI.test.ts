import { jest } from '@jest/globals';
import { PriceAPI } from '../../api/PriceAPI';
import { createMockFetchApi, mockResponse } from '../utils/testUtils';

// Mock BaseAPI
jest.mock('../../api/BaseAPI', () => {
  return {
    __esModule: true,
    BaseAPI: jest.fn().mockImplementation(() => ({
      fetchApi: jest.fn(),
    })),
  };
});

describe('PriceAPI', () => {
  let api: PriceAPI;
  let mockFetchApi: ReturnType<typeof createMockFetchApi>;

  beforeEach(() => {
    mockFetchApi = createMockFetchApi();
    api = new PriceAPI({
      baseUrl: 'http://test.com',
      apiKey: 'test-key',
    });
    (api as any).fetchApi = mockFetchApi;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getCurrentPrices', () => {
    const expectedResponse = {
      prices: {
        'token-1': {
          price: 100,
          timestamp: '2024-01-01T00:00:00Z',
          change24h: 5,
        },
      },
    };

    it('should get current prices', async () => {
      mockFetchApi.mockResolvedValueOnce(mockResponse(expectedResponse));

      const result = await api.getCurrentPrices();
      expect(result.data).toEqual(expectedResponse);
      expect(mockFetchApi).toHaveBeenCalledWith('/price/current', {
        method: 'GET',
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(api.getCurrentPrices()).rejects.toThrow(
        'Failed to get current prices: API Error'
      );
    });
  });

  describe('getPriceHistory', () => {
    const expectedResponse = {
      history: [
        {
          price: 100,
          timestamp: '2024-01-01T00:00:00Z',
        },
      ],
    };

    it('should get price history without options', async () => {
      mockFetchApi.mockResolvedValueOnce(mockResponse(expectedResponse));

      const result = await api.getPriceHistory('token-1');
      expect(result.data).toEqual(expectedResponse);
      expect(mockFetchApi).toHaveBeenCalledWith('/price/history/token-1', {
        method: 'GET',
      });
    });

    it('should get price history with options', async () => {
      mockFetchApi.mockResolvedValueOnce(mockResponse(expectedResponse));

      const result = await api.getPriceHistory('token-1', {
        interval: '24h',
        limit: 10,
      });
      expect(result.data).toEqual(expectedResponse);
      expect(mockFetchApi).toHaveBeenCalledWith(
        '/price/history/token-1?interval=24h&limit=10',
        {
          method: 'GET',
        }
      );
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(api.getPriceHistory('token-1')).rejects.toThrow(
        'Failed to get price history: API Error'
      );
    });
  });
});
