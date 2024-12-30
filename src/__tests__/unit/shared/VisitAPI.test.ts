import { jest } from '@jest/globals';
import { VisitAPI } from '../../../shared/api/VisitAPI';
import {
  MockBrowserEnvironment,
  createMockResponse,
} from '../../utils/testUtils';
import { HttpMethod } from '../../../shared/interfaces/http';
import type { Response, RequestInit } from 'node-fetch';
import type {
  VisitData,
  CreateVisitRequest,
  UpdatePresenceRequest,
  PresenceData,
} from '../../../shared/interfaces/api';

type FetchFunction = (url: string, init?: RequestInit) => Promise<Response>;

describe('VisitAPI Unit Tests', () => {
  const BASE_URL = 'https://test.example.com';
  let api: VisitAPI<Response, RequestInit>;
  let mockFetch: jest.MockedFunction<FetchFunction>;
  let mockEnvironment: MockBrowserEnvironment;

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
    mockEnvironment = new MockBrowserEnvironment('test-fingerprint');
    mockFetch = jest.fn<FetchFunction>();
    mockEnvironment.fetch = mockFetch as any;
    api = new VisitAPI({
      baseUrl: BASE_URL,
      environment: mockEnvironment as any,
    });
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

      mockFetch.mockResolvedValueOnce(createMockResponse(mockVisitData));

      await api.createVisit(request);

      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/visit/create`, {
        method: HttpMethod.POST,
        body: request,
        headers: {
          'content-type': 'application/json',
          'user-agent': 'test-fingerprint',
        },
      });
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
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
      mockFetch.mockResolvedValueOnce(createMockResponse(mockVisitData));

      await api.getVisit('test-visit-id');

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/visit/test-visit-id`,
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

      mockFetch.mockResolvedValueOnce(createMockResponse(mockPresenceData));

      await api.updatePresence(request);

      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/visit/presence`, {
        method: HttpMethod.POST,
        body: request,
        headers: {
          'content-type': 'application/json',
          'user-agent': 'test-fingerprint',
        },
      });
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
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
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ visits: [mockVisitData] })
      );

      await api.getVisitHistory('test-fingerprint-id', { limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/visit/history/test-fingerprint-id?limit=10`,
        {
          method: HttpMethod.GET,
          headers: {
            'content-type': 'application/json',
            'user-agent': 'test-fingerprint',
          },
        }
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
      await expect(
        api.getVisitHistory('test-fingerprint-id')
      ).rejects.toThrow();
    });
  });
});
