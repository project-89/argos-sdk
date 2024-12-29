import { jest } from '@jest/globals';
import type {
  APIKeyData,
  ApiResponse,
  CreateAPIKeyRequest,
  RevokeAPIKeyRequest,
  UpdateAPIKeyRequest,
} from '../../../shared/interfaces/api';
import { APIKeyAPI } from '../../../shared/api/APIKeyAPI';
import { MockEnvironment } from '../../../__tests__/utils/testUtils';
import { HttpMethod } from '../../../shared/interfaces/http';

// Unit tests with mocks
describe('APIKeyAPI Unit Tests', () => {
  let api: APIKeyAPI<Response>;
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

    const mockEnvironment = new MockEnvironment('test-fingerprint');
    api = new APIKeyAPI<Response>({
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
        body: {
          key: 'test-api-key',
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
        body: request,
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
        body: request,
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
        body: request,
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
