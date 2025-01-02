import { jest } from '@jest/globals';
import { FingerprintAPI } from '../../../shared/api/FingerprintAPI';
import {
  MockBrowserEnvironment,
  createMockResponse,
} from '../../utils/testUtils';
import { HttpMethod } from '../../../shared/interfaces/http';
import type { Response, RequestInit } from 'node-fetch';
import type { ApiResponse, Fingerprint } from '../../../shared/interfaces/api';

type FetchFunction = (url: string, init?: RequestInit) => Promise<Response>;

describe('FingerprintAPI', () => {
  const BASE_URL = 'https://test.example.com';
  let api: FingerprintAPI<Response, RequestInit>;
  let mockFetch: jest.MockedFunction<FetchFunction>;
  let mockEnvironment: MockBrowserEnvironment;

  beforeEach(() => {
    mockEnvironment = new MockBrowserEnvironment('test-fingerprint');
    mockFetch = jest.fn<FetchFunction>();
    mockEnvironment.fetch = mockFetch as any;
    api = new FingerprintAPI({
      baseUrl: BASE_URL,
      environment: mockEnvironment as any,
    });
  });

  describe('createFingerprint', () => {
    it('should call API with correct parameters', async () => {
      const fingerprintId = 'test-fingerprint-id';
      const options = { metadata: { key: 'value' } };

      const mockFingerprint: Fingerprint = {
        id: fingerprintId,
        fingerprint: fingerprintId,
        roles: [],
        createdAt: { _seconds: 0, _nanoseconds: 0 },
        metadata: options.metadata,
        ipAddresses: [],
        ipMetadata: {
          ipFrequency: {},
          lastSeenAt: {},
          primaryIp: '',
          suspiciousIps: [],
        },
        tags: [],
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockFingerprint));

      await api.createFingerprint(fingerprintId, options);

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/fingerprint/register`,
        {
          method: HttpMethod.POST,
          skipAuth: true,
          body: {
            fingerprint: fingerprintId,
            metadata: options.metadata,
          },
          headers: {
            'content-type': 'application/json',
            'user-agent': 'test-fingerprint',
          },
        }
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.createFingerprint('test-id', {})).rejects.toThrow();
    });
  });

  describe('getFingerprint', () => {
    it('should call API with correct parameters', async () => {
      const fingerprintId = 'test-fingerprint-id';

      const mockFingerprint: Fingerprint = {
        id: fingerprintId,
        fingerprint: fingerprintId,
        roles: [],
        createdAt: { _seconds: 0, _nanoseconds: 0 },
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

      mockFetch.mockResolvedValueOnce(createMockResponse(mockFingerprint));

      await api.getFingerprint(fingerprintId);

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/fingerprint/${fingerprintId}`,
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
      await expect(api.getFingerprint('test-id')).rejects.toThrow();
    });
  });

  describe('updateFingerprint', () => {
    it('should call API with correct parameters', async () => {
      const fingerprintId = 'test-fingerprint-id';
      const metadata = { key: 'updated-value' };

      const mockFingerprint: Fingerprint = {
        id: fingerprintId,
        fingerprint: fingerprintId,
        roles: [],
        createdAt: { _seconds: 0, _nanoseconds: 0 },
        metadata,
        ipAddresses: [],
        ipMetadata: {
          ipFrequency: {},
          lastSeenAt: {},
          primaryIp: '',
          suspiciousIps: [],
        },
        tags: [],
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockFingerprint));

      await api.updateFingerprint(fingerprintId, metadata);

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/fingerprint/${fingerprintId}`,
        {
          method: HttpMethod.PUT,
          body: { metadata },
          headers: {
            'content-type': 'application/json',
            'user-agent': 'test-fingerprint',
          },
        }
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.updateFingerprint('test-id', {})).rejects.toThrow();
    });
  });

  describe('deleteFingerprint', () => {
    it('should call API with correct parameters', async () => {
      const fingerprintId = 'test-fingerprint-id';

      mockFetch.mockResolvedValueOnce(createMockResponse(undefined));

      await api.deleteFingerprint(fingerprintId);

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/fingerprint/${fingerprintId}`,
        {
          method: HttpMethod.DELETE,
          headers: {
            'content-type': 'application/json',
            'user-agent': 'test-fingerprint',
          },
        }
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.deleteFingerprint('test-id')).rejects.toThrow();
    });
  });
});
