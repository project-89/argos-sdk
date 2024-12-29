import { jest } from '@jest/globals';
import { PriceAPI } from '../../../shared/api/PriceAPI';
import { MockEnvironment } from '../../../__tests__/utils/testUtils';
import { HttpMethod, CommonResponse } from '../../../shared/interfaces/http';
import type {
  PriceData,
  PriceHistoryData,
} from '../../../shared/interfaces/api';

describe('PriceAPI', () => {
  let api: PriceAPI<CommonResponse>;
  let mockFetchApi: jest.Mock;

  const mockPriceData: PriceData = {
    prices: {
      token1: {
        price: 100,
        timestamp: new Date().toISOString(),
        change24h: 5,
      },
      token2: {
        price: 200,
        timestamp: new Date().toISOString(),
        change24h: -2,
      },
    },
  };

  const mockPriceHistoryData: PriceHistoryData = {
    history: [
      {
        price: 100,
        timestamp: new Date().toISOString(),
      },
      {
        price: 110,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  beforeEach(() => {
    mockFetchApi = jest.fn(() =>
      Promise.resolve({
        success: true,
        data: mockPriceData,
      })
    );

    const mockEnvironment = new MockEnvironment('test-fingerprint');
    api = new PriceAPI<CommonResponse>({
      baseUrl: 'http://test.com',
      environment: mockEnvironment,
      debug: true,
    });
    (api as any).fetchApi = mockFetchApi;
  });

  describe('getCurrentPrices', () => {
    it('should call API with correct parameters', async () => {
      const tokens = ['token1', 'token2'];
      mockFetchApi.mockImplementationOnce(() =>
        Promise.resolve({
          success: true,
          data: mockPriceData,
        })
      );

      await api.getCurrentPrices({ tokens });

      expect(mockFetchApi).toHaveBeenCalledWith(
        '/price/current?tokens=token1%2Ctoken2',
        {
          method: HttpMethod.GET,
        }
      );
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockImplementationOnce(() =>
        Promise.reject(new Error('API Error'))
      );
      await expect(
        api.getCurrentPrices({ tokens: ['token1'] })
      ).rejects.toThrow();
    });
  });

  describe('getPriceHistory', () => {
    it('should call API with correct parameters', async () => {
      mockFetchApi.mockImplementationOnce(() =>
        Promise.resolve({
          success: true,
          data: mockPriceHistoryData,
        })
      );

      await api.getPriceHistory('token1', { interval: '24h', limit: 10 });

      expect(mockFetchApi).toHaveBeenCalledWith(
        '/price/history/token1?interval=24h&limit=10',
        {
          method: HttpMethod.GET,
        }
      );
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockImplementationOnce(() =>
        Promise.reject(new Error('API Error'))
      );
      await expect(api.getPriceHistory('token1')).rejects.toThrow();
    });
  });
});
