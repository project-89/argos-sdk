import { jest } from '@jest/globals';
import { PriceAPI } from '../../../shared/api/PriceAPI';
import {
  MockBrowserEnvironment,
  createMockResponse,
} from '../../utils/testUtils';
import { HttpMethod } from '../../../shared/interfaces/http';
import type { Response, RequestInit } from 'node-fetch';
import type {
  PriceData,
  PriceHistoryData,
} from '../../../shared/interfaces/api';

type FetchFunction = (url: string, init?: RequestInit) => Promise<Response>;

describe('PriceAPI', () => {
  const BASE_URL = 'https://test.example.com';
  let api: PriceAPI<Response, RequestInit>;
  let mockFetch: jest.MockedFunction<FetchFunction>;
  let mockEnvironment: MockBrowserEnvironment;

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
    mockEnvironment = new MockBrowserEnvironment('test-fingerprint');
    mockFetch = jest.fn<FetchFunction>();
    mockEnvironment.fetch = mockFetch as any;
    api = new PriceAPI({
      baseUrl: BASE_URL,
      environment: mockEnvironment as any,
    });
  });

  describe('getCurrentPrices', () => {
    it('should call API with correct parameters', async () => {
      const tokens = ['token1', 'token2'];
      mockFetch.mockResolvedValueOnce(createMockResponse(mockPriceData));

      await api.getCurrentPrices({ tokens });

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/price/current?tokens=token1%2Ctoken2`,
        {
          method: HttpMethod.GET,
          headers: {
            'user-agent': 'test-fingerprint',
            'content-type': 'application/json',
          },
        }
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
      await expect(
        api.getCurrentPrices({ tokens: ['token1'] })
      ).rejects.toThrow();
    });
  });

  describe('getPriceHistory', () => {
    it('should call API with correct parameters', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(mockPriceHistoryData));

      await api.getPriceHistory('token1', { interval: '24h', limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/price/history/token1?interval=24h&limit=10`,
        {
          method: HttpMethod.GET,
          headers: {
            'user-agent': 'test-fingerprint',
            'content-type': 'application/json',
          },
        }
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.getPriceHistory('token1')).rejects.toThrow();
    });
  });
});
