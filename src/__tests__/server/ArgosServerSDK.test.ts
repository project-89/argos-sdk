import { ArgosServerSDK } from '../../server/sdk/ArgosServerSDK';
import {
  ApiResponse,
  ImpressionData,
  Fingerprint,
  VisitData,
  PresenceData,
} from '../../types/api';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ArgosServerSDK', () => {
  let sdk: ArgosServerSDK;
  const mockConfig = {
    baseUrl: 'https://api.example.com',
    apiKey: 'test-api-key',
    debug: true,
  };

  beforeEach(() => {
    sdk = new ArgosServerSDK(mockConfig);
    mockFetch.mockClear();
  });

  describe('Identity Management', () => {
    it('should create a fingerprint', async () => {
      const mockFingerprint: Fingerprint = {
        id: 'test-id',
        fingerprint: 'test-fingerprint',
        roles: [],
        createdAt: {
          _seconds: 1234567890,
          _nanoseconds: 0,
        },
        metadata: {},
        ipAddresses: [],
        ipMetadata: {
          ipFrequency: {},
          lastSeenAt: {},
          primaryIp: '',
          suspiciousIps: [],
        },
        tags: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockFingerprint }),
      });

      const result = await sdk.identify({
        fingerprint: 'test-fingerprint',
        metadata: {},
      });

      expect(result.data).toEqual(mockFingerprint);
    });
  });

  describe('Visit Tracking', () => {
    it('should track a visit', async () => {
      const mockVisit: VisitData = {
        id: 'test-visit-id',
        fingerprintId: 'test-fingerprint',
        url: 'https://example.com',
        title: 'Test Page',
        timestamp: '2024-01-01T00:00:00Z',
        site: {
          domain: 'example.com',
          visitCount: 1,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockVisit }),
      });

      const result = await sdk.track('visit', {
        fingerprintId: 'test-fingerprint',
        url: 'https://example.com',
        title: 'Test Page',
      });

      expect(result.data).toEqual(mockVisit);
    });

    it('should track presence', async () => {
      const mockPresence = {
        fingerprintId: 'test-fingerprint',
        status: 'online',
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockPresence }),
      });

      const result = await sdk.track('presence', {
        fingerprintId: 'test-fingerprint',
        status: 'online',
      });

      expect(result.data).toEqual(mockPresence);
    });

    it('should track custom events', async () => {
      const mockCustom = {
        id: 'test-custom-id',
        fingerprintId: 'test-fingerprint',
        url: 'https://example.com/custom',
        title: 'Custom Event',
        timestamp: '2024-01-01T00:00:00Z',
        type: 'custom',
        site: {
          domain: 'example.com',
          visitCount: 1,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockCustom }),
      });

      const result = await sdk.track('custom', {
        fingerprintId: 'test-fingerprint',
        url: 'https://example.com/custom',
        title: 'Custom Event',
      });

      expect(result.data).toEqual(mockCustom);
    });
  });

  describe('Impression Management', () => {
    it('should create an impression', async () => {
      const mockResponse: ApiResponse<ImpressionData> = {
        success: true,
        data: {
          id: 'test-id',
          fingerprintId: 'test-fingerprint',
          type: 'test-type',
          data: { test: 'data' },
          createdAt: '2024-01-01T00:00:00Z',
          source: 'server',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await sdk.createImpression({
        fingerprintId: 'test-fingerprint',
        type: 'test-type',
        data: { test: 'data' },
      });

      expect(result).toEqual(mockResponse);
    });

    it('should get impressions', async () => {
      const mockResponse: ApiResponse<ImpressionData[]> = {
        success: true,
        data: [
          {
            id: 'test-id',
            fingerprintId: 'test-fingerprint',
            type: 'test-type',
            data: { test: 'data' },
            createdAt: '2024-01-01T00:00:00Z',
            source: 'server',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await sdk.getImpressions('test-fingerprint', {
        type: 'test-type',
        startTime: '2024-01-01',
        endTime: '2024-01-02',
      });

      expect(result).toEqual(mockResponse);
    });

    it('should delete impressions', async () => {
      const mockResponse: ApiResponse<void> = {
        success: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await sdk.deleteImpressions('test-fingerprint', {
        type: 'test-type',
      });

      expect(result).toEqual(mockResponse);
    });
  });
});
