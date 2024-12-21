import { jest } from '@jest/globals';
import { VisitAPI } from '../../api/VisitAPI';
import type { VisitData, PresenceData } from '../../types/api';
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

describe('VisitAPI', () => {
  let api: VisitAPI;
  let mockFetchApi: ReturnType<typeof createMockFetchApi>;
  const testTimestamp = new Date('2024-01-01').getTime();

  beforeEach(() => {
    mockFetchApi = createMockFetchApi();
    api = new VisitAPI({
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

  describe('createVisit', () => {
    it('should create visit', async () => {
      const mockVisitData: VisitData = {
        id: 'test-id',
        fingerprintId: 'test-fingerprint',
        url: 'http://test.com',
        title: 'Test Page',
        timestamp: new Date(testTimestamp).toISOString(),
        site: {
          domain: 'test.com',
          visitCount: 1,
        },
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockVisitData));

      const result = await api.createVisit({
        fingerprintId: 'test-fingerprint',
        url: 'http://test.com',
        title: 'Test Page',
      });
      expect(result.data).toEqual(mockVisitData);
      expect(mockFetchApi).toHaveBeenCalledWith('/visit/log', {
        method: 'POST',
        body: JSON.stringify({
          fingerprintId: 'test-fingerprint',
          url: 'http://test.com',
          title: 'Test Page',
        }),
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(
        api.createVisit({
          fingerprintId: 'test-fingerprint',
          url: 'http://test.com',
        })
      ).rejects.toThrow('Failed to log visit: API Error');
    });
  });

  describe('updatePresence', () => {
    it('should update presence', async () => {
      const mockPresenceData: PresenceData = {
        success: true,
        timestamp: new Date(testTimestamp).toISOString(),
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockPresenceData));

      const result = await api.updatePresence({
        fingerprintId: 'test-fingerprint',
        status: 'active',
      });

      expect(result.data).toEqual(mockPresenceData);
      expect(mockFetchApi).toHaveBeenCalledWith('/visit/presence', {
        method: 'POST',
        body: JSON.stringify({
          fingerprintId: 'test-fingerprint',
          status: 'active',
        }),
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(
        api.updatePresence({
          fingerprintId: 'test-fingerprint',
          status: 'active',
        })
      ).rejects.toThrow('Failed to update presence: API Error');
    });
  });

  describe('getVisitHistory', () => {
    it('should get visit history without options', async () => {
      const mockVisits: VisitData[] = [
        {
          id: 'test-id',
          fingerprintId: 'test-fingerprint',
          url: 'http://test.com',
          title: 'Test Page',
          timestamp: new Date(testTimestamp).toISOString(),
          site: {
            domain: 'test.com',
            visitCount: 1,
          },
        },
      ];

      mockFetchApi.mockResolvedValueOnce(mockResponse({ visits: mockVisits }));

      const result = await api.getVisitHistory('test-fingerprint');
      expect(result.data?.visits).toEqual(mockVisits);
      expect(mockFetchApi).toHaveBeenCalledWith(
        '/visit/history/test-fingerprint',
        {
          method: 'GET',
        }
      );
    });

    it('should get visit history with options', async () => {
      const mockVisits: VisitData[] = [
        {
          id: 'test-id',
          fingerprintId: 'test-fingerprint',
          url: 'http://test.com',
          title: 'Test Page',
          timestamp: new Date(testTimestamp).toISOString(),
          site: {
            domain: 'test.com',
            visitCount: 1,
          },
        },
      ];

      mockFetchApi.mockResolvedValueOnce(mockResponse({ visits: mockVisits }));

      const options = {
        limit: 10,
        offset: 0,
        startDate: '2024-01-01',
        endDate: '2024-01-02',
      };

      const result = await api.getVisitHistory('test-fingerprint', options);
      expect(result.data?.visits).toEqual(mockVisits);
      expect(mockFetchApi).toHaveBeenCalledWith(
        '/visit/history/test-fingerprint?limit=10&offset=0&startDate=2024-01-01&endDate=2024-01-02',
        {
          method: 'GET',
        }
      );
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(api.getVisitHistory('test-fingerprint')).rejects.toThrow(
        'Failed to get visit history: API Error'
      );
    });
  });
});
