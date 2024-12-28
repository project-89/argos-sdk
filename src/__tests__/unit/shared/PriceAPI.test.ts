import { jest } from '@jest/globals';
import { PriceAPI } from '../../../shared/api/PriceAPI';
import type {
  PriceData,
  PriceHistoryData,
} from '../../../shared/interfaces/api';
import {
  createMockFetchApi,
  mockResponse,
  MockEnvironment,
} from '../../utils/testUtils';
import { RuntimeEnvironment } from '../../../shared/interfaces/environment';

// Mock BaseAPI
jest.mock('../../../shared/api/BaseAPI', () => {
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
      environment: new MockEnvironment(
        'test-fingerprint',
        'test-api-key',
        undefined,
        RuntimeEnvironment.Node
      ),
      debug: true,
    });
    (api as any).fetchApi = mockFetchApi;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getCurrentPrices', () => {
    it('should get current prices successfully', async () => {
      const mockPriceData: PriceData = {
        prices: {
          token1: {
            price: 100,
            timestamp: '2023-01-01T00:00:00Z',
            change24h: 5,
          },
          token2: {
            price: 200,
            timestamp: '2023-01-01T00:00:00Z',
            change24h: -2,
          },
        },
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockPriceData));

      const result = await api.getCurrentPrices({
        tokens: ['token1', 'token2'],
      });

      expect(result.data).toEqual(mockPriceData);
      expect(mockFetchApi).toHaveBeenCalledWith(
        '/price/current?tokens=token1%2Ctoken2',
        {
          method: 'GET',
        }
      );
    });
  });

  describe('getPriceHistory', () => {
    it('should get price history successfully', async () => {
      const mockHistoryData: PriceHistoryData = {
        history: [
          {
            price: 100,
            timestamp: '2023-01-01T00:00:00Z',
          },
          {
            price: 110,
            timestamp: '2023-01-02T00:00:00Z',
          },
        ],
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockHistoryData));

      const result = await api.getPriceHistory('token1', {
        interval: '24h',
        limit: 10,
      });

      expect(result.data).toEqual(mockHistoryData);
      expect(mockFetchApi).toHaveBeenCalledWith(
        '/price/history/token1?interval=24h&limit=10',
        {
          method: 'GET',
        }
      );
    });
  });
});
