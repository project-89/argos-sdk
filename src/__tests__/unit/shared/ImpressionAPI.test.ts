import { jest } from '@jest/globals';
import { ImpressionAPI } from '../../../shared/api/ImpressionAPI';
import type { ImpressionData } from '../../../shared/interfaces/api';
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

describe('ImpressionAPI', () => {
  let api: ImpressionAPI;
  let mockFetchApi: ReturnType<typeof createMockFetchApi>;

  beforeEach(() => {
    mockFetchApi = createMockFetchApi();
    api = new ImpressionAPI({
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

  describe('createImpression', () => {
    it('should create an impression successfully', async () => {
      const mockImpressionData: ImpressionData = {
        id: 'test-id',
        fingerprintId: 'test-fingerprint',
        type: 'test-type',
        data: { test: 'data' },
        createdAt: '2023-01-01T00:00:00Z',
        source: 'test-source',
        sessionId: 'test-session',
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockImpressionData));

      const result = await api.createImpression({
        fingerprintId: 'test-fingerprint',
        type: 'test-type',
        data: { test: 'data' },
        source: 'test-source',
        sessionId: 'test-session',
      });

      expect(result.data).toEqual(mockImpressionData);
      expect(mockFetchApi).toHaveBeenCalledWith('/impressions', {
        method: 'POST',
        body: JSON.stringify({
          fingerprintId: 'test-fingerprint',
          type: 'test-type',
          data: { test: 'data' },
          source: 'test-source',
          sessionId: 'test-session',
        }),
      });
    });
  });

  describe('getImpressions', () => {
    it('should get impressions successfully', async () => {
      const mockImpressionData: ImpressionData[] = [
        {
          id: 'test-id',
          fingerprintId: 'test-fingerprint',
          type: 'test-type',
          data: { test: 'data' },
          createdAt: '2023-01-01T00:00:00Z',
          source: 'test-source',
          sessionId: 'test-session',
        },
      ];

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockImpressionData));

      const result = await api.getImpressions('test-fingerprint', {
        type: 'test-type',
        startTime: '2023-01-01T00:00:00Z',
        endTime: '2023-01-02T00:00:00Z',
        limit: 10,
        sessionId: 'test-session',
      });

      expect(result.data).toEqual(mockImpressionData);
      expect(mockFetchApi).toHaveBeenCalledWith(
        '/impressions/test-fingerprint?type=test-type&startTime=2023-01-01T00%3A00%3A00Z&endTime=2023-01-02T00%3A00%3A00Z&limit=10&sessionId=test-session',
        {
          method: 'GET',
        }
      );
    });
  });

  describe('deleteImpressions', () => {
    it('should delete impressions successfully', async () => {
      const mockResponse = { deletedCount: 1 };
      mockFetchApi.mockImplementationOnce(async () => ({
        success: true,
        data: mockResponse,
      }));

      const result = await api.deleteImpressions('test-fingerprint', {
        type: 'test-type',
        startTime: '2023-01-01T00:00:00Z',
        endTime: '2023-01-02T00:00:00Z',
        sessionId: 'test-session',
      });

      expect(result.data).toEqual(mockResponse);
      expect(mockFetchApi).toHaveBeenCalledWith(
        '/impressions/test-fingerprint?type=test-type&startTime=2023-01-01T00%3A00%3A00Z&endTime=2023-01-02T00%3A00%3A00Z&sessionId=test-session',
        {
          method: 'DELETE',
        }
      );
    });
  });
});
