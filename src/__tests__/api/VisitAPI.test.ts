import { jest } from '@jest/globals';
import { VisitAPI } from '../../api/VisitAPI';
import type { VisitData, PresenceData } from '../../api/VisitAPI';
import {
  createMockFetchApi,
  mockBaseAPI,
  mockResponse,
} from '../utils/testUtils';

jest.mock('@/api/BaseAPI', () => mockBaseAPI());

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
      const visitRequest: VisitData = {
        fingerprintId: 'test-fingerprint',
        url: 'http://test.com',
        timestamp: testTimestamp,
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(undefined));

      const result = await api.createVisit(visitRequest);
      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
      expect(mockFetchApi).toHaveBeenCalledWith('/visit/log', {
        method: 'POST',
        body: JSON.stringify(visitRequest),
      });
    });
  });

  describe('updatePresence', () => {
    it('should update presence', async () => {
      const presenceData: PresenceData = {
        fingerprintId: 'test-fingerprint',
        status: 'online',
        timestamp: testTimestamp,
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(undefined));

      const result = await api.updatePresence(presenceData);

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
      expect(mockFetchApi).toHaveBeenCalledWith('/visit/presence', {
        method: 'POST',
        body: JSON.stringify(presenceData),
      });
    });
  });

  describe('getHistory', () => {
    it('should get visit history', async () => {
      const mockVisits: VisitData[] = [
        {
          fingerprintId: 'test-fingerprint',
          url: 'http://test.com',
          timestamp: testTimestamp,
        },
      ];

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockVisits));

      const result = await api.getHistory('test-fingerprint');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockVisits);
      expect(mockFetchApi).toHaveBeenCalledWith(
        '/visit/history/test-fingerprint',
        {
          method: 'GET',
        }
      );
    });
  });

  describe('removeSite', () => {
    it('should remove site', async () => {
      const request = {
        fingerprintId: 'test-fingerprint',
        url: 'http://test.com',
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(undefined));

      const result = await api.removeSite(request);
      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
      expect(mockFetchApi).toHaveBeenCalledWith('/visit/site/remove', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    });
  });
});
