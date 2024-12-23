import { jest } from '@jest/globals';
import { FingerprintAPI } from '../../api/FingerprintAPI';
import { FingerprintData } from '../../types/api';
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
      const mockFingerprintData: FingerprintData = {
        id: 'test-id',
        fingerprint: 'test-fingerprint',
        roles: ['user'],
        createdAt: new Date().toISOString(),
        metadata: {
          userAgent: 'test-user-agent',
          language: 'en-US',
          platform: 'test-platform',
        },
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockFingerprintData));

      const result = await api.createFingerprint({
        fingerprint: 'test-fingerprint',
        metadata: {
          userAgent: 'test-user-agent',
          language: 'en-US',
          platform: 'test-platform',
        },
      });
      expect(result.data).toEqual(mockFingerprintData);
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
      const mockFingerprintData: FingerprintData = {
        id: 'test-id',
        fingerprint: 'test-fingerprint',
        roles: ['user'],
        createdAt: new Date().toISOString(),
        metadata: {
          userAgent: 'test-user-agent',
          language: 'en-US',
          platform: 'test-platform',
        },
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockFingerprintData));

      const result = await api.getFingerprint('test-id');
      expect(result.data).toEqual(mockFingerprintData);
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
      const mockFingerprintData: FingerprintData = {
        id: 'test-id',
        fingerprint: 'test-fingerprint',
        roles: ['user'],
        createdAt: new Date().toISOString(),
        metadata: {
          userAgent: 'updated-user-agent',
          language: 'en-US',
          platform: 'test-platform',
        },
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockFingerprintData));

      const result = await api.updateFingerprint('test-id', {
        metadata: {
          userAgent: 'updated-user-agent',
          language: 'en-US',
          platform: 'test-platform',
        },
      });
      expect(result.data).toEqual(mockFingerprintData);
      expect(mockFetchApi).toHaveBeenCalledWith('/fingerprint/test-id', {
        method: 'PUT',
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
