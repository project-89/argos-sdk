import { jest } from '@jest/globals';
import { VisitAPI } from '../../api/VisitAPI';

import {
  createMockFetchApi,
  mockBaseAPI,
  mockResponse,
} from '../utils/testUtils';

jest.mock('@/api/BaseAPI', () => mockBaseAPI());

describe('VisitAPI', () => {
  let api: VisitAPI;
  let mockFetchApi: ReturnType<typeof createMockFetchApi>;

  beforeEach(() => {
    mockFetchApi = createMockFetchApi();
    api = new VisitAPI({
      baseUrl: 'http://test.com',
      apiKey: 'test-key',
    });
    (api as any).fetchApi = mockFetchApi;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createVisit', () => {
    it('should create visit', async () => {
      const visitRequest = {
        fingerprintId: 'test-fingerprint',
        url: 'http://test.com',
        timestamp: new Date().toISOString(),
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(undefined));

      const result = await api.createVisit(visitRequest);
      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
      expect(mockFetchApi).toHaveBeenCalledWith('/visit', {
        method: 'POST',
        body: JSON.stringify({
          ...visitRequest,
          timestamp: visitRequest.timestamp,
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
          timestamp: new Date().toISOString(),
        })
      ).rejects.toThrow('Failed to create visit: API Error');
    });
  });

  describe('updatePresence', () => {
    it('should update presence', async () => {
      const timestamp = new Date().toISOString();
      const presenceData = {
        fingerprintId: 'test-fingerprint',
        currentPage: '/test-page',
        timestamp,
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(undefined));

      const result = await api.updatePresence(presenceData);
      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
      expect(mockFetchApi).toHaveBeenCalledWith('/presence', {
        method: 'POST',
        body: JSON.stringify({
          ...presenceData,
          timestamp,
        }),
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(
        api.updatePresence({
          fingerprintId: 'test-fingerprint',
          currentPage: '/test-page',
          timestamp: new Date().toISOString(),
        })
      ).rejects.toThrow('Failed to update presence: API Error');
    });
  });
});
