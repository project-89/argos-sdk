import { jest } from '@jest/globals';
import type {
  APIKeyData,
  ApiResponse,
  CreateAPIKeyRequest,
  RevokeAPIKeyRequest,
  UpdateAPIKeyRequest,
} from '../../../shared/interfaces/api';
import { APIKeyAPI } from '../../../shared/api/APIKeyAPI';
import { createMockEnvironment } from '../../../__tests__/utils/testUtils';
import { HttpMethod } from '../../../shared/interfaces/http';

// Unit tests with mocks
describe('APIKeyAPI Unit Tests', () => {
  let api: APIKeyAPI;
  let mockFetchApi: jest.MockedFunction<
    (path: string, options?: any) => Promise<ApiResponse<any>>
  >;

  const mockAPIKeyData: APIKeyData = {
    key: 'test-key',
    fingerprintId: 'test-fingerprint-id',
    expiresAt: new Date().toISOString(),
  };

  beforeEach(() => {
    mockFetchApi = jest.fn().mockImplementation(async () => ({
      success: true,
      data: mockAPIKeyData,
    })) as jest.MockedFunction<
      (path: string, options?: any) => Promise<ApiResponse<any>>
    >;

    const mockEnvironment = createMockEnvironment();
    api = new APIKeyAPI({
      baseUrl: 'http://test.com',
      environment: mockEnvironment,
      debug: true,
    });
    (api as any).fetchApi = mockFetchApi;
  });

  describe('validateAPIKey', () => {
    it('should call API with correct parameters', async () => {
      mockFetchApi.mockResolvedValueOnce({
        success: true,
        data: true,
      });

      await api.validateAPIKey('test-api-key');

      expect(mockFetchApi).toHaveBeenCalledWith('/api-key/validate', {
        method: HttpMethod.POST,
        headers: {
          'x-api-key': 'test-api-key',
        },
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.validateAPIKey('test-api-key')).rejects.toThrow();
    });
  });

  describe('registerInitialApiKey', () => {
    it('should call API with correct parameters', async () => {
      const metadata = {
        userAgent: 'test-user-agent',
        platform: 'test-platform',
      };

      await api.registerInitialApiKey('test-fingerprint-id', metadata);

      expect(mockFetchApi).toHaveBeenCalledWith('/api-key/register', {
        method: HttpMethod.POST,
        body: {
          fingerprintId: 'test-fingerprint-id',
          metadata,
        },
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(
        api.registerInitialApiKey('test-fingerprint-id', {})
      ).rejects.toThrow();
    });
  });

  describe('createAPIKey', () => {
    it('should call API with correct parameters', async () => {
      const request: CreateAPIKeyRequest = {
        name: 'test-key',
        expiresAt: '2024-12-31T23:59:59Z',
      };

      await api.createAPIKey(request);

      expect(mockFetchApi).toHaveBeenCalledWith('/api-key', {
        method: HttpMethod.POST,
        body: JSON.stringify(request),
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(
        api.createAPIKey({
          name: 'test-key',
        })
      ).rejects.toThrow();
    });
  });

  describe('revokeAPIKey', () => {
    it('should call API with correct parameters', async () => {
      const request: RevokeAPIKeyRequest = {
        key: 'test-key',
      };

      await api.revokeAPIKey(request);

      expect(mockFetchApi).toHaveBeenCalledWith('/api-key/revoke', {
        method: HttpMethod.POST,
        body: JSON.stringify(request),
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(
        api.revokeAPIKey({
          key: 'test-key',
        })
      ).rejects.toThrow();
    });
  });

  describe('getAPIKey', () => {
    it('should call API with correct parameters', async () => {
      await api.getAPIKey('test-key-id');

      expect(mockFetchApi).toHaveBeenCalledWith('/api-key/test-key-id');
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.getAPIKey('test-key-id')).rejects.toThrow();
    });
  });

  describe('listAPIKeys', () => {
    it('should call API with correct parameters', async () => {
      mockFetchApi.mockResolvedValueOnce({
        success: true,
        data: [mockAPIKeyData],
      });

      await api.listAPIKeys();

      expect(mockFetchApi).toHaveBeenCalledWith('/api-key');
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.listAPIKeys()).rejects.toThrow();
    });
  });

  describe('updateAPIKey', () => {
    it('should call API with correct parameters', async () => {
      const request: UpdateAPIKeyRequest = {
        name: 'updated-key',
        expiresAt: '2024-12-31T23:59:59Z',
      };

      await api.updateAPIKey('test-key-id', request);

      expect(mockFetchApi).toHaveBeenCalledWith('/api-key/test-key-id', {
        method: HttpMethod.PUT,
        body: JSON.stringify(request),
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(
        api.updateAPIKey('test-key-id', {
          name: 'updated-key',
        })
      ).rejects.toThrow();
    });
  });

  describe('deleteAPIKey', () => {
    it('should call API with correct parameters', async () => {
      mockFetchApi.mockResolvedValueOnce({
        success: true,
        data: true,
      });

      await api.deleteAPIKey('test-key-id');

      expect(mockFetchApi).toHaveBeenCalledWith('/api-key/test-key-id', {
        method: HttpMethod.DELETE,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.deleteAPIKey('test-key-id')).rejects.toThrow();
    });
  });
});

// Integration tests with real API calls
describe('APIKeyAPI Integration Tests', () => {
  let api: APIKeyAPI;
  let testKeyId: string;

  beforeAll(async () => {
    // Skip integration tests if ARGOS_API_URL is not set
    if (!process.env.ARGOS_API_URL) {
      console.log('Skipping integration tests - ARGOS_API_URL not set');
      return;
    }

    const mockEnvironment = createMockEnvironment();
    api = new APIKeyAPI({
      baseUrl: process.env.ARGOS_API_URL,
      environment: mockEnvironment,
      debug: true,
    });

    try {
      // Create a test API key for use in tests
      const result = await api.createAPIKey({
        name: 'test-key',
        expiresAt: '2024-12-31T23:59:59Z',
      });
      testKeyId = result.data.key;
    } catch (error) {
      console.log('Failed to create test API key:', error);
    }
  });

  afterAll(async () => {
    if (!process.env.ARGOS_API_URL) {
      return;
    }
    if (testKeyId) {
      try {
        await api.deleteAPIKey(testKeyId);
      } catch (error) {
        console.log('Failed to delete test API key:', error);
      }
    }
  });

  describe('validateAPIKey', () => {
    it('should validate valid API key', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const result = await api.validateAPIKey('test-api-key');
      expect(result.success).toBe(true);
    });

    it('should reject invalid API key', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(api.validateAPIKey('invalid-key')).rejects.toThrow();
    });
  });

  describe('registerInitialApiKey', () => {
    it('should register new API key', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const result = await api.registerInitialApiKey('test-fingerprint', {
        userAgent: 'test-user-agent',
        platform: 'test-platform',
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('key');
      expect(result.data).toHaveProperty('fingerprintId', 'test-fingerprint');
      expect(result.data).toHaveProperty('expiresAt');

      // Clean up
      await api.deleteAPIKey(result.data.key);
    });

    it('should handle invalid fingerprint', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(
        api.registerInitialApiKey('invalid-fingerprint', {})
      ).rejects.toThrow();
    });
  });

  describe('createAPIKey', () => {
    it('should create new API key', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const result = await api.createAPIKey({
        name: 'test-key',
        expiresAt: '2024-12-31T23:59:59Z',
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('key');
      expect(result.data).toHaveProperty('fingerprintId');
      expect(result.data).toHaveProperty('expiresAt');

      // Clean up
      await api.deleteAPIKey(result.data.key);
    });

    it('should handle invalid request', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(
        api.createAPIKey({
          name: '',
        })
      ).rejects.toThrow();
    });
  });

  describe('revokeAPIKey', () => {
    it('should revoke API key', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      // Create a key to revoke
      const createResult = await api.createAPIKey({
        name: 'key-to-revoke',
      });

      const result = await api.revokeAPIKey({
        key: createResult.data.key,
      });

      expect(result.success).toBe(true);
    });

    it('should handle invalid key', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(
        api.revokeAPIKey({
          key: 'invalid-key',
        })
      ).rejects.toThrow();
    });
  });

  describe('getAPIKey', () => {
    it('should get API key', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const result = await api.getAPIKey(testKeyId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('key', testKeyId);
      expect(result.data).toHaveProperty('fingerprintId');
      expect(result.data).toHaveProperty('expiresAt');
    });

    it('should handle non-existent key', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(api.getAPIKey('non-existent-key')).rejects.toThrow();
    });
  });

  describe('listAPIKeys', () => {
    it('should list API keys', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const result = await api.listAPIKeys();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      if (result.data.length > 0) {
        const key = result.data[0];
        expect(key).toHaveProperty('key');
        expect(key).toHaveProperty('fingerprintId');
        expect(key).toHaveProperty('expiresAt');
      }
    });
  });

  describe('updateAPIKey', () => {
    it('should update API key', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const updateData: UpdateAPIKeyRequest = {
        name: 'updated-key',
        expiresAt: '2024-12-31T23:59:59Z',
      };

      const result = await api.updateAPIKey(testKeyId, updateData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('key', testKeyId);
      expect(result.data).toHaveProperty('name', updateData.name);
      expect(result.data).toHaveProperty('expiresAt', updateData.expiresAt);
    });

    it('should handle non-existent key', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(
        api.updateAPIKey('non-existent-key', {
          name: 'updated-key',
        })
      ).rejects.toThrow();
    });
  });

  describe('deleteAPIKey', () => {
    it('should delete API key', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      // Create a key to delete
      const createResult = await api.createAPIKey({
        name: 'key-to-delete',
      });

      const result = await api.deleteAPIKey(createResult.data.key);
      expect(result.success).toBe(true);

      // Verify the key was deleted
      await expect(api.getAPIKey(createResult.data.key)).rejects.toThrow();
    });

    it('should handle non-existent key', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(api.deleteAPIKey('non-existent-key')).rejects.toThrow();
    });
  });
});
