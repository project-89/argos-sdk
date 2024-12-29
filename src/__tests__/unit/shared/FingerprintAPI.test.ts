import { jest } from '@jest/globals';
import { FingerprintAPI } from '../../../shared/api/FingerprintAPI';
import { MockEnvironment } from '../../../__tests__/utils/testUtils';
import { HttpMethod, CommonResponse } from '../../../shared/interfaces/http';
import type { Fingerprint } from '../../../shared/interfaces/api';

describe('FingerprintAPI', () => {
  let api: FingerprintAPI<CommonResponse>;
  let mockFetchApi: jest.Mock;

  const mockFingerprint: Fingerprint = {
    id: 'test-fingerprint-id',
    fingerprint: 'test-fingerprint',
    roles: ['user'],
    createdAt: {
      _seconds: Math.floor(Date.now() / 1000),
      _nanoseconds: 0,
    },
    metadata: { key: 'value' },
    ipAddresses: ['127.0.0.1'],
    ipMetadata: {
      ipFrequency: { '127.0.0.1': 1 },
      lastSeenAt: {
        '127.0.0.1': {
          _seconds: Math.floor(Date.now() / 1000),
          _nanoseconds: 0,
        },
      },
      primaryIp: '127.0.0.1',
      suspiciousIps: [],
    },
    tags: ['tag1'],
  };

  beforeEach(() => {
    mockFetchApi = jest.fn(() =>
      Promise.resolve({
        success: true,
        data: mockFingerprint,
      })
    );

    const mockEnvironment = new MockEnvironment('test-fingerprint');
    api = new FingerprintAPI<CommonResponse>({
      baseUrl: 'http://test.com',
      environment: mockEnvironment,
      debug: true,
    });
    (api as any).fetchApi = mockFetchApi;
  });

  describe('createFingerprint', () => {
    it('should call API with correct parameters', async () => {
      const options = {
        metadata: { key: 'value' },
      };

      await api.createFingerprint('test-fingerprint', options);

      expect(mockFetchApi).toHaveBeenCalledWith('/fingerprint/register', {
        method: HttpMethod.POST,
        body: {
          fingerprint: 'test-fingerprint',
          metadata: options.metadata,
        },
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockImplementationOnce(() =>
        Promise.reject(new Error('API Error'))
      );
      await expect(api.createFingerprint('test-fingerprint')).rejects.toThrow();
    });
  });

  describe('getFingerprint', () => {
    it('should call API with correct parameters', async () => {
      await api.getFingerprint('test-fingerprint-id');

      expect(mockFetchApi).toHaveBeenCalledWith(
        '/fingerprint/test-fingerprint-id',
        {
          method: HttpMethod.GET,
        }
      );
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockImplementationOnce(() =>
        Promise.reject(new Error('API Error'))
      );
      await expect(api.getFingerprint('test-fingerprint-id')).rejects.toThrow();
    });
  });

  describe('updateFingerprint', () => {
    it('should call API with correct parameters', async () => {
      const updateData = {
        metadata: { key: 'updated-value' },
      };

      await api.updateFingerprint('test-fingerprint-id', updateData);

      expect(mockFetchApi).toHaveBeenCalledWith(
        '/fingerprint/test-fingerprint-id',
        {
          method: HttpMethod.PUT,
          body: updateData,
        }
      );
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockImplementationOnce(() =>
        Promise.reject(new Error('API Error'))
      );
      await expect(
        api.updateFingerprint('test-fingerprint-id', { metadata: {} })
      ).rejects.toThrow();
    });
  });

  describe('deleteFingerprint', () => {
    it('should call API with correct parameters', async () => {
      await api.deleteFingerprint('test-fingerprint-id');

      expect(mockFetchApi).toHaveBeenCalledWith(
        '/fingerprint/test-fingerprint-id',
        {
          method: HttpMethod.DELETE,
        }
      );
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockImplementationOnce(() =>
        Promise.reject(new Error('API Error'))
      );
      await expect(
        api.deleteFingerprint('test-fingerprint-id')
      ).rejects.toThrow();
    });
  });
});
