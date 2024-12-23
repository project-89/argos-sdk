import { jest } from '@jest/globals';
import { FingerprintAPI } from '../../api/FingerprintAPI';
import { Fingerprint } from '../../types/api';
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
  let mockFetchApi: ReturnType<typeof createMockFetchApi>;

  beforeEach(() => {
    mockFetchApi = createMockFetchApi();
    api = new FingerprintAPI({
      baseUrl: 'http://test.com',
      apiKey: 'test-key',
    });
    (api as any).fetchApi = mockFetchApi;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createFingerprint', () => {
    it('should create fingerprint', async () => {
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
          metadata: {
            userAgent: 'test-user-agent',
            language: 'en-US',
            platform: 'test-platform',
          },
        })
      ).rejects.toThrow('Failed to create fingerprint: API Error');
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

      const result = await api.updateFingerprint('test-id', {
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
        api.updateFingerprint('test-id', {
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
