import { jest } from '@jest/globals';
import { FingerprintAPI } from '../../api/FingerprintAPI';
import { ApiResponse, Fingerprint } from '../../types/api';
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

describe('FingerprintAPI', () => {
  let api: FingerprintAPI;
  let mockFetchApi: ReturnType<typeof jest.fn>;

  beforeEach(() => {
    mockFetchApi = jest.fn();
    api = new FingerprintAPI({
      baseUrl: 'http://localhost',
      debug: true,
    });
    (api as any).fetchApi = mockFetchApi;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createFingerprint', () => {
    const mockFingerprint: Fingerprint = {
      id: 'test-id',
      fingerprint: 'test-fingerprint',
      createdAt: {
        _seconds: 1234567890,
        _nanoseconds: 0,
      },
      metadata: {},
      roles: [],
      tags: [],
      ipAddresses: [],
      ipMetadata: {
        primaryIp: '',
        ipFrequency: {},
        lastSeenAt: {},
        suspiciousIps: [],
      },
    };

    it('should create fingerprint', async () => {
      const mockApiResponse = { success: true, data: mockFingerprint };
      mockFetchApi.mockResolvedValueOnce(mockApiResponse);

      const result = await api.createFingerprint({
        fingerprint: 'test-fingerprint',
        metadata: {
          userAgent: 'test-user-agent',
          language: 'en-US',
          platform: 'test-platform',
        },
      });

      expect(result.data).toEqual(mockFingerprint);
      expect(mockFetchApi).toHaveBeenCalledWith('/fingerprint/register', {
        method: 'POST',
        body: JSON.stringify({
          fingerprint: 'test-fingerprint',
          metadata: {
            userAgent: 'test-user-agent',
            language: 'en-US',
            platform: 'test-platform',
          },
        }),
        isPublic: true,
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(
        api.createFingerprint({
          fingerprint: 'test-fingerprint',
        })
      ).rejects.toThrow('API Error');
    });
  });

  describe('getFingerprint', () => {
    it('should get fingerprint', async () => {
      const mockFingerprint: Fingerprint = {
        id: 'test-id',
        fingerprint: 'test-fingerprint',
        roles: ['user'],
        createdAt: {
          _seconds: 1234567890,
          _nanoseconds: 0,
        },
        metadata: {
          userAgent: 'test-user-agent',
          language: 'en-US',
          platform: 'test-platform',
        },
        ipAddresses: ['127.0.0.1'],
        ipMetadata: {
          ipFrequency: {
            '127.0.0.1': 1,
          },
          lastSeenAt: {
            '127.0.0.1': {
              _seconds: 1234567890,
              _nanoseconds: 0,
            },
          },
          primaryIp: '127.0.0.1',
          suspiciousIps: [],
        },
        tags: [],
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockFingerprint));

      const result = await api.getFingerprint('test-id');
      expect(result.data).toEqual(mockFingerprint);
      expect(mockFetchApi).toHaveBeenCalledWith('/fingerprint/test-id', {
        method: 'GET',
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(api.getFingerprint('test-id')).rejects.toThrow(
        'Failed to get fingerprint: API Error'
      );
    });
  });

  describe('updateFingerprint', () => {
    it('should update fingerprint', async () => {
      const mockFingerprint: Fingerprint = {
        id: 'test-id',
        fingerprint: 'test-fingerprint',
        roles: ['user'],
        createdAt: {
          _seconds: 1234567890,
          _nanoseconds: 0,
        },
        metadata: {
          userAgent: 'updated-user-agent',
          language: 'en-US',
          platform: 'test-platform',
        },
        ipAddresses: ['127.0.0.1'],
        ipMetadata: {
          ipFrequency: {
            '127.0.0.1': 1,
          },
          lastSeenAt: {
            '127.0.0.1': {
              _seconds: 1234567890,
              _nanoseconds: 0,
            },
          },
          primaryIp: '127.0.0.1',
          suspiciousIps: [],
        },
        tags: [],
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockFingerprint));

      const result = await api.updateFingerprint({
        metadata: {
          userAgent: 'updated-user-agent',
          language: 'en-US',
          platform: 'test-platform',
        },
      });
      expect(result.data).toEqual(mockFingerprint);
      expect(mockFetchApi).toHaveBeenCalledWith('/fingerprint/update', {
        method: 'POST',
        body: JSON.stringify({
          metadata: {
            userAgent: 'updated-user-agent',
            language: 'en-US',
            platform: 'test-platform',
          },
        }),
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(
        api.updateFingerprint({
          metadata: {
            userAgent: 'updated-user-agent',
            language: 'en-US',
            platform: 'test-platform',
          },
        })
      ).rejects.toThrow('Failed to update fingerprint: API Error');
    });
  });
});
