import { jest } from '@jest/globals';
import { VisitAPI } from '../../../shared/api/VisitAPI';
import { createMockEnvironment } from '../../../__tests__/utils/testUtils';
import type {
  ApiResponse,
  VisitData,
  PresenceData,
} from '../../../shared/interfaces/api';
import { HttpMethod } from '../../../shared/interfaces/http';

// Unit tests with mocks
describe('VisitAPI Unit Tests', () => {
  let api: VisitAPI;
  let mockFetchApi: jest.MockedFunction<
    (path: string, options?: any) => Promise<ApiResponse<any>>
  >;

  const mockVisitData: VisitData = {
    id: 'test-id',
    fingerprintId: 'test-fingerprint',
    url: 'http://test.com',
    title: 'Test Page',
    timestamp: '2024-01-01T00:00:00.000Z',
    site: {
      domain: 'test.com',
      visitCount: 1,
    },
  };

  const mockPresenceData: PresenceData = {
    timestamp: '2024-01-01T00:00:00.000Z',
    success: true,
  };

  beforeEach(() => {
    mockFetchApi = jest.fn().mockImplementation(async () => ({
      success: true,
      data: mockVisitData,
    })) as jest.MockedFunction<
      (path: string, options?: any) => Promise<ApiResponse<any>>
    >;

    const mockEnvironment = createMockEnvironment();
    api = new VisitAPI({
      baseUrl: 'http://test.com',
      environment: mockEnvironment,
      debug: true,
    });
    (api as any).fetchApi = mockFetchApi;
  });

  describe('createVisit', () => {
    it('should call API with correct parameters', async () => {
      const visitData = {
        fingerprintId: 'test-fingerprint',
        url: 'http://test.com',
        title: 'Test Page',
      };

      await api.createVisit(visitData);

      expect(mockFetchApi).toHaveBeenCalledWith('/visit/log', {
        method: HttpMethod.POST,
        body: visitData,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(
        api.createVisit({
          fingerprintId: 'test-fingerprint',
          url: 'http://test.com',
        })
      ).rejects.toThrow();
    });
  });

  describe('updatePresence', () => {
    it('should call API with correct parameters', async () => {
      mockFetchApi.mockResolvedValueOnce({
        success: true,
        data: mockPresenceData,
      });

      const presenceData = {
        fingerprintId: 'test-fingerprint',
        status: 'online' as const,
      };

      await api.updatePresence(presenceData);

      expect(mockFetchApi).toHaveBeenCalledWith('/visit/presence', {
        method: HttpMethod.POST,
        body: presenceData,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(
        api.updatePresence({
          fingerprintId: 'test-fingerprint',
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

      await api.getVisitHistory('test-fingerprint');

      expect(mockFetchApi).toHaveBeenCalledWith(
        '/visit/history/test-fingerprint',
        {
          method: HttpMethod.GET,
        }
      );
    });

    it('should call API with query parameters', async () => {
      mockFetchApi.mockResolvedValueOnce({
        success: true,
        data: { visits: [mockVisitData] },
      });

      const options = {
        limit: 10,
        startDate: '2024-01-01',
        endDate: '2024-01-02',
      };

      await api.getVisitHistory('test-fingerprint', options);

      expect(mockFetchApi).toHaveBeenCalledWith(
        '/visit/history/test-fingerprint?limit=10&startDate=2024-01-01&endDate=2024-01-02',
        {
          method: HttpMethod.GET,
        }
      );
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.getVisitHistory('test-fingerprint')).rejects.toThrow();
    });
  });
});

// Integration tests with real API calls
describe('VisitAPI Integration Tests', () => {
  let api: VisitAPI;

  beforeAll(async () => {
    // Skip integration tests if ARGOS_API_URL is not set
    if (!process.env.ARGOS_API_URL) {
      console.log('Skipping integration tests - ARGOS_API_URL not set');
      return;
    }

    const mockEnvironment = createMockEnvironment();
    api = new VisitAPI({
      baseUrl: process.env.ARGOS_API_URL,
      environment: mockEnvironment,
      debug: true,
    });
  });

  describe('createVisit', () => {
    it('should create visit with metadata', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const visitData = {
        fingerprintId: 'test-fingerprint',
        url: 'http://test.com',
        title: 'Test Page',
      };

      const result = await api.createVisit(visitData);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        fingerprintId: visitData.fingerprintId,
        url: visitData.url,
        title: visitData.title,
      });
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('timestamp');
      expect(result.data).toHaveProperty('site');
    });

    it('should handle invalid fingerprint', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(
        api.createVisit({
          fingerprintId: 'invalid-fingerprint',
          url: 'http://test.com',
        })
      ).rejects.toThrow();
    });
  });

  describe('updatePresence', () => {
    it('should update presence status', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const presenceData = {
        fingerprintId: 'test-fingerprint',
        status: 'online' as const,
      };

      const result = await api.updatePresence(presenceData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('timestamp');
    });

    it('should handle invalid fingerprint', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(
        api.updatePresence({
          fingerprintId: 'invalid-fingerprint',
          status: 'online',
        })
      ).rejects.toThrow();
    });
  });

  describe('getVisitHistory', () => {
    it('should get visit history without options', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const result = await api.getVisitHistory('test-fingerprint');

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data?.visits)).toBe(true);
      if (result.data?.visits.length > 0) {
        const visit = result.data.visits[0];
        expect(visit).toHaveProperty('id');
        expect(visit).toHaveProperty('fingerprintId');
        expect(visit).toHaveProperty('url');
        expect(visit).toHaveProperty('timestamp');
        expect(visit).toHaveProperty('site');
      }
    });

    it('should get visit history with options', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const options = {
        limit: 10,
        startDate: '2024-01-01',
        endDate: '2024-01-02',
      };

      const result = await api.getVisitHistory('test-fingerprint', options);

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data?.visits)).toBe(true);
    });

    it('should handle invalid fingerprint', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(
        api.getVisitHistory('invalid-fingerprint')
      ).rejects.toThrow();
    });
  });
});
