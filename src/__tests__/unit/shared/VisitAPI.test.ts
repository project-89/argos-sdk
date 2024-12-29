import { jest } from '@jest/globals';
import { VisitAPI } from '../../../shared/api/VisitAPI';
import { MockEnvironment } from '../../../__tests__/utils/testUtils';
import type {
  ApiResponse,
  VisitData,
  CreateVisitRequest,
  UpdatePresenceRequest,
  PresenceData,
} from '../../../shared/interfaces/api';
import { HttpMethod } from '../../../shared/interfaces/http';

describe('VisitAPI Unit Tests', () => {
  let api: VisitAPI<Response>;
  let mockFetchApi: jest.MockedFunction<
    (path: string, options?: any) => Promise<ApiResponse<any>>
  >;

  const mockVisitData: VisitData = {
    id: 'test-visit-id',
    fingerprintId: 'test-fingerprint-id',
    url: 'http://test.com',
    title: 'Test Page',
    timestamp: new Date().toISOString(),
    site: {
      domain: 'test.com',
      visitCount: 1,
    },
  };

  const mockPresenceData: PresenceData = {
    success: true,
    timestamp: new Date().toISOString(),
  };

  beforeEach(() => {
    mockFetchApi = jest.fn().mockImplementation(async () => ({
      success: true,
      data: mockVisitData,
    })) as jest.MockedFunction<
      (path: string, options?: any) => Promise<ApiResponse<any>>
    >;

    const mockEnvironment = new MockEnvironment('test-fingerprint');
    api = new VisitAPI<Response>({
      baseUrl: 'http://test.com',
      environment: mockEnvironment,
      debug: true,
    });
    (api as any).fetchApi = mockFetchApi;
  });

  describe('createVisit', () => {
    it('should call API with correct parameters', async () => {
      const request: CreateVisitRequest = {
        fingerprintId: 'test-fingerprint-id',
        url: 'http://test.com',
        title: 'Test Page',
        metadata: {
          userAgent: 'test-user-agent',
          platform: 'test-platform',
        },
      };

      await api.createVisit(request);

      expect(mockFetchApi).toHaveBeenCalledWith('/visit/create', {
        method: HttpMethod.POST,
        body: request,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(
        api.createVisit({
          fingerprintId: 'test-fingerprint-id',
          url: 'http://test.com',
        })
      ).rejects.toThrow();
    });
  });

  describe('getVisit', () => {
    it('should call API with correct parameters', async () => {
      await api.getVisit('test-visit-id');
      expect(mockFetchApi).toHaveBeenCalledWith('/visit/test-visit-id', {
        method: HttpMethod.GET,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.getVisit('test-visit-id')).rejects.toThrow();
    });
  });

  describe('updatePresence', () => {
    it('should call API with correct parameters', async () => {
      const request: UpdatePresenceRequest = {
        fingerprintId: 'test-fingerprint-id',
        status: 'online',
        metadata: {
          userAgent: 'test-user-agent',
          platform: 'test-platform',
        },
      };

      mockFetchApi.mockResolvedValueOnce({
        success: true,
        data: mockPresenceData,
      });

      await api.updatePresence(request);

      expect(mockFetchApi).toHaveBeenCalledWith('/visit/presence', {
        method: HttpMethod.POST,
        body: request,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(
        api.updatePresence({
          fingerprintId: 'test-fingerprint-id',
          status: 'online',
        })
      ).rejects.toThrow();
    });
  });

  describe('getVisitHistory', () => {
    it('should call API with correct parameters', async () => {
      mockFetchApi.mockResolvedValueOnce({
        success: true,
        data: { visits: [mockVisitData] },
      });

      await api.getVisitHistory('test-fingerprint-id', { limit: 10 });

      expect(mockFetchApi).toHaveBeenCalledWith(
        '/visit/history/test-fingerprint-id?limit=10',
        {
          method: HttpMethod.GET,
        }
      );
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(
        api.getVisitHistory('test-fingerprint-id')
      ).rejects.toThrow();
    });
  });
});
