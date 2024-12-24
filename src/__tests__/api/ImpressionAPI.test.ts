import { jest } from '@jest/globals';
import { ImpressionAPI } from '../../api/ImpressionAPI';
import type { ImpressionData } from '../../types/api';
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

describe('ImpressionAPI', () => {
  let api: ImpressionAPI;
  let mockFetchApi: ReturnType<typeof createMockFetchApi>;
  const testTimestamp = new Date('2024-01-01').getTime();

  beforeEach(() => {
    mockFetchApi = createMockFetchApi();
    api = new ImpressionAPI({
      baseUrl: 'http://test.com',
      apiKey: 'test-key',
    });
    (api as any).fetchApi = mockFetchApi;
    jest.useFakeTimers();
    jest.setSystemTime(new Date(testTimestamp));
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  describe('createImpression', () => {
    it('should create impression', async () => {
      const mockImpressionData: ImpressionData = {
        id: 'test-id',
        fingerprintId: 'test-fingerprint',
        type: 'test-type',
        data: { test: true },
        createdAt: new Date(testTimestamp).toISOString(),
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockImpressionData));

      const request = {
        fingerprintId: 'test-fingerprint',
        type: 'test-type',
        data: { test: true },
      };

      const result = await api.createImpression(request);

      expect(result.data).toEqual(mockImpressionData);
      expect(mockFetchApi).toHaveBeenCalledWith('/impressions', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      const request = {
        fingerprintId: 'test-fingerprint',
        type: 'test-type',
        data: { test: true },
      };

      await expect(api.createImpression(request)).rejects.toThrow(
        'Failed to create impression: API Error'
      );
    });
  });

  describe('getImpressions', () => {
    it('should get impressions without options', async () => {
      const mockImpressions: ImpressionData[] = [
        {
          id: 'test-id',
          fingerprintId: 'test-fingerprint',
          type: 'test-type',
          data: { test: true },
          createdAt: new Date(testTimestamp).toISOString(),
        },
      ];

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockImpressions));

      const result = await api.getImpressions('test-fingerprint');

      expect(result.data).toEqual(mockImpressions);
      expect(mockFetchApi).toHaveBeenCalledWith(
        '/impressions/test-fingerprint',
        {
          method: 'GET',
        }
      );
    });

    it('should get impressions with options', async () => {
      const mockImpressions: ImpressionData[] = [
        {
          id: 'test-id',
          fingerprintId: 'test-fingerprint',
          type: 'test-type',
          data: { test: true },
          createdAt: new Date(testTimestamp).toISOString(),
        },
      ];

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockImpressions));

      const options = {
        type: 'test-type',
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-01-02T00:00:00Z',
        limit: 10,
        sessionId: 'test-session',
      };

      const result = await api.getImpressions('test-fingerprint', options);

      expect(result.data).toEqual(mockImpressions);
      expect(mockFetchApi).toHaveBeenCalledWith(
        '/impressions/test-fingerprint?type=test-type&startTime=2024-01-01T00%3A00%3A00Z&endTime=2024-01-02T00%3A00%3A00Z&limit=10&sessionId=test-session',
        {
          method: 'GET',
        }
      );
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(api.getImpressions('test-fingerprint')).rejects.toThrow(
        'Failed to get impressions: API Error'
      );
    });
  });

  describe('deleteImpressions', () => {
    it('should delete impressions without options', async () => {
      const mockResponse = { deletedCount: 1 };

      mockFetchApi.mockResolvedValueOnce({ success: true, data: mockResponse });

      const result = await api.deleteImpressions('test-fingerprint');

      expect(result.data).toEqual(mockResponse);
      expect(mockFetchApi).toHaveBeenCalledWith(
        '/impressions/test-fingerprint',
        {
          method: 'DELETE',
        }
      );
    });

    it('should delete impressions with options', async () => {
      const mockResponse = { deletedCount: 1 };

      mockFetchApi.mockResolvedValueOnce({ success: true, data: mockResponse });

      const options = {
        type: 'test-type',
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-01-02T00:00:00Z',
        sessionId: 'test-session',
      };

      const result = await api.deleteImpressions('test-fingerprint', options);

      expect(result.data).toEqual(mockResponse);
      expect(mockFetchApi).toHaveBeenCalledWith(
        '/impressions/test-fingerprint?type=test-type&startTime=2024-01-01T00%3A00%3A00Z&endTime=2024-01-02T00%3A00%3A00Z&sessionId=test-session',
        {
          method: 'DELETE',
        }
      );
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(api.deleteImpressions('test-fingerprint')).rejects.toThrow(
        'Failed to delete impressions: API Error'
      );
    });
  });
});
