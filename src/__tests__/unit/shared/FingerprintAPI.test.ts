import { jest } from '@jest/globals';
import { FingerprintAPI } from '../../../shared/api/FingerprintAPI';
import { createMockEnvironment } from '../../../__tests__/utils/testUtils';
import type { ApiResponse, Fingerprint } from '../../../shared/interfaces/api';
import { HttpMethod } from '../../../shared/interfaces/http';

// Unit tests with mocks
describe('FingerprintAPI Unit Tests', () => {
  let api: FingerprintAPI;
  let mockFetchApi: jest.MockedFunction<
    (path: string, options?: any) => Promise<ApiResponse<any>>
  >;

  const mockFingerprintData: Fingerprint = {
    id: 'test-id',
    fingerprint: 'test-fingerprint',
    roles: ['user'],
    createdAt: { _seconds: 0, _nanoseconds: 0 },
    metadata: {
      userAgent: 'test-user-agent',
      language: 'en-US',
      platform: 'test-platform',
    },
    ipAddresses: [],
    ipMetadata: {
      ipFrequency: {},
      lastSeenAt: {},
      primaryIp: '',
      suspiciousIps: [],
    },
    tags: [],
  };

  beforeEach(() => {
    mockFetchApi = jest.fn().mockImplementation(async () => ({
      success: true,
      data: mockFingerprintData,
    })) as jest.MockedFunction<
      (path: string, options?: any) => Promise<ApiResponse<any>>
    >;

    const mockEnvironment = createMockEnvironment();
    api = new FingerprintAPI({
      baseUrl: 'http://test.com',
      environment: mockEnvironment,
      debug: true,
    });
    (api as any).fetchApi = mockFetchApi;
  });

  describe('createFingerprint', () => {
    it('should call API with correct parameters', async () => {
      const metadata = {
        userAgent: 'test-user-agent',
        language: 'en-US',
        platform: 'test-platform',
      };

      await api.createFingerprint('test-fingerprint', { metadata });

      expect(mockFetchApi).toHaveBeenCalledWith('/fingerprint/register', {
        method: HttpMethod.POST,
        body: {
          fingerprint: 'test-fingerprint',
          metadata,
        },
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.createFingerprint('test-fingerprint')).rejects.toThrow();
    });
  });

  describe('getFingerprint', () => {
    it('should call API with correct parameters', async () => {
      await api.getFingerprint('test-id');
      expect(mockFetchApi).toHaveBeenCalledWith('/fingerprint/test-id', {
        method: HttpMethod.GET,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.getFingerprint('test-id')).rejects.toThrow();
    });
  });

  describe('updateFingerprint', () => {
    it('should call API with correct parameters', async () => {
      const updateData = {
        metadata: {
          userAgent: 'updated-user-agent',
        },
      };

      await api.updateFingerprint('test-id', updateData);

      expect(mockFetchApi).toHaveBeenCalledWith('/fingerprint/test-id', {
        method: HttpMethod.PUT,
        body: updateData,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(
        api.updateFingerprint('test-id', { metadata: {} })
      ).rejects.toThrow();
    });
  });

  describe('deleteFingerprint', () => {
    it('should call API with correct parameters', async () => {
      await api.deleteFingerprint('test-id');
      expect(mockFetchApi).toHaveBeenCalledWith('/fingerprint/test-id', {
        method: HttpMethod.DELETE,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.deleteFingerprint('test-id')).rejects.toThrow();
    });
  });
});

// Integration tests with real API calls
describe('FingerprintAPI Integration Tests', () => {
  let api: FingerprintAPI;
  let testFingerprintId: string;

  beforeAll(async () => {
    // Skip integration tests if ARGOS_API_URL is not set
    if (!process.env.ARGOS_API_URL) {
      console.log('Skipping integration tests - ARGOS_API_URL not set');
      return;
    }

    const mockEnvironment = createMockEnvironment();
    api = new FingerprintAPI({
      baseUrl: process.env.ARGOS_API_URL,
      environment: mockEnvironment,
      debug: true,
    });

    try {
      const result = await api.createFingerprint('test-fingerprint', {
        metadata: {
          userAgent: 'test-user-agent',
          language: 'en-US',
          platform: 'test-platform',
        },
      });
      testFingerprintId = result.data.id;
    } catch (error) {
      console.log('Failed to create test fingerprint:', error);
    }
  });

  afterAll(async () => {
    if (!process.env.ARGOS_API_URL) {
      return;
    }
    if (testFingerprintId) {
      try {
        await api.deleteFingerprint(testFingerprintId);
      } catch (error) {
        console.log('Failed to delete test fingerprint:', error);
      }
    }
  });

  describe('createFingerprint', () => {
    it('should create fingerprint with metadata', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const result = await api.createFingerprint('new-test-fingerprint', {
        metadata: {
          userAgent: 'test-user-agent',
          language: 'en-US',
          platform: 'test-platform',
        },
      });

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        fingerprint: 'new-test-fingerprint',
        metadata: {
          userAgent: 'test-user-agent',
          language: 'en-US',
          platform: 'test-platform',
        },
      });
      expect(result.data).toHaveProperty('id');

      // Clean up
      await api.deleteFingerprint(result.data.id);
    });

    it('should handle duplicate fingerprint', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(api.createFingerprint('test-fingerprint')).rejects.toThrow();
    });
  });

  describe('getFingerprint', () => {
    it('should get existing fingerprint', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const result = await api.getFingerprint(testFingerprintId);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: testFingerprintId,
        fingerprint: 'test-fingerprint',
      });
      expect(result.data).toHaveProperty('createdAt');
      expect(result.data).toHaveProperty('roles');
      expect(result.data).toHaveProperty('metadata');
      expect(result.data).toHaveProperty('ipAddresses');
      expect(result.data).toHaveProperty('ipMetadata');
      expect(result.data).toHaveProperty('tags');
    });

    it('should handle non-existent fingerprint', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(api.getFingerprint('non-existent-id')).rejects.toThrow();
    });
  });

  describe('updateFingerprint', () => {
    it('should update fingerprint metadata', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const updateData = {
        metadata: {
          userAgent: 'updated-user-agent',
          language: 'fr-FR',
          platform: 'updated-platform',
        },
      };

      const result = await api.updateFingerprint(testFingerprintId, updateData);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: testFingerprintId,
        metadata: updateData.metadata,
      });

      // Verify the update persisted
      const getResult = await api.getFingerprint(testFingerprintId);
      expect(getResult.data.metadata).toMatchObject(updateData.metadata);
    });

    it('should handle non-existent fingerprint', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(
        api.updateFingerprint('non-existent-id', {
          metadata: {
            userAgent: 'test',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('deleteFingerprint', () => {
    it('should delete existing fingerprint', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      // Create a new fingerprint to delete
      const createResult = await api.createFingerprint('fingerprint-to-delete');
      const fingerprintId = createResult.data.id;

      // Delete the fingerprint
      const result = await api.deleteFingerprint(fingerprintId);
      expect(result.success).toBe(true);

      // Verify the fingerprint was deleted
      await expect(api.getFingerprint(fingerprintId)).rejects.toThrow();
    });

    it('should handle non-existent fingerprint', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(api.deleteFingerprint('non-existent-id')).rejects.toThrow();
    });
  });
});
