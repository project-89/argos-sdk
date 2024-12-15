import { jest } from '@jest/globals';
import { APIKeyAPI, APIKeyData } from '../../api/APIKeyAPI';
import {
  createMockFetchApi,
  mockBaseAPI,
  mockResponse,
} from '../utils/testUtils';

jest.mock('@/api/BaseAPI', () => mockBaseAPI());

describe('APIKeyAPI', () => {
  let api: APIKeyAPI;
  let mockFetchApi: ReturnType<typeof createMockFetchApi>;

  beforeEach(() => {
    mockFetchApi = createMockFetchApi();
    api = new APIKeyAPI({
      baseUrl: 'http://test.com',
      apiKey: 'test-key',
    });
    (api as any).fetchApi = mockFetchApi;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('validateAPIKey', () => {
    it('should validate API key', async () => {
      mockFetchApi.mockResolvedValueOnce(mockResponse(true));

      const result = await api.validateAPIKey('test-key');
      expect(result.data).toBe(true);
      expect(mockFetchApi).toHaveBeenCalledWith('/api-key/validate', {
        method: 'POST',
        body: JSON.stringify({ apiKey: 'test-key' }),
        isPublic: true,
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(api.validateAPIKey('test-key')).rejects.toThrow(
        'Failed to validate API key: API Error'
      );
    });
  });

  describe('registerInitialApiKey', () => {
    it('should register initial API key', async () => {
      const mockResponse = {
        key: 'new-api-key',
        fingerprintId: 'test-fingerprint',
      };

      mockFetchApi.mockResolvedValueOnce({ success: true, data: mockResponse });

      const result = await api.registerInitialApiKey('test-fingerprint', {
        source: 'test',
      });
      expect(result.data).toEqual(mockResponse);
      expect(mockFetchApi).toHaveBeenCalledWith('/api-key/register', {
        method: 'POST',
        body: JSON.stringify({
          fingerprintId: 'test-fingerprint',
          name: 'fingerprint-test-fingerprint',
          metadata: { source: 'test' },
        }),
        isPublic: true,
      });
    });
  });

  describe('createAPIKey', () => {
    it('should create API key', async () => {
      const mockAPIKeyData: APIKeyData = {
        id: 'test-id',
        name: 'test-key',
        key: 'api-key-123',
        fingerprintId: 'test-fingerprint',
        enabled: true,
        expiresAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockAPIKeyData));

      const result = await api.createAPIKey({
        name: 'test-key',
        expiresAt: mockAPIKeyData.expiresAt,
      });
      expect(result.data).toEqual(mockAPIKeyData);
      expect(mockFetchApi).toHaveBeenCalledWith('/api-key', {
        method: 'POST',
        body: JSON.stringify({
          name: 'test-key',
          expiresAt: mockAPIKeyData.expiresAt,
        }),
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(
        api.createAPIKey({
          name: 'test-key',
          expiresAt: new Date().toISOString(),
        })
      ).rejects.toThrow('Failed to create API key: API Error');
    });
  });

  describe('getAPIKey', () => {
    it('should get API key', async () => {
      const mockAPIKeyData: APIKeyData = {
        id: 'test-id',
        name: 'test-key',
        key: 'api-key-123',
        fingerprintId: 'test-fingerprint',
        enabled: true,
        expiresAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockAPIKeyData));

      const result = await api.getAPIKey('test-id');
      expect(result.data).toEqual(mockAPIKeyData);
      expect(mockFetchApi).toHaveBeenCalledWith('/api-key/test-id', {
        method: 'GET',
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(api.getAPIKey('test-id')).rejects.toThrow(
        'Failed to get API key: API Error'
      );
    });
  });

  describe('listAPIKeys', () => {
    it('should list API keys', async () => {
      const mockAPIKeys: APIKeyData[] = [
        {
          id: 'test-id',
          name: 'test-key',
          key: 'api-key-123',
          fingerprintId: 'test-fingerprint',
          enabled: true,
          expiresAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockAPIKeys));

      const result = await api.listAPIKeys();
      expect(result.data).toEqual(mockAPIKeys);
      expect(mockFetchApi).toHaveBeenCalledWith('/api-key', {
        method: 'GET',
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(api.listAPIKeys()).rejects.toThrow(
        'Failed to list API keys: API Error'
      );
    });
  });

  describe('updateAPIKey', () => {
    it('should update API key', async () => {
      const mockAPIKeyData: APIKeyData = {
        id: 'test-id',
        name: 'updated-key',
        key: 'api-key-123',
        fingerprintId: 'test-fingerprint',
        enabled: true,
        expiresAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockAPIKeyData));

      const result = await api.updateAPIKey('test-id', {
        name: 'updated-key',
        expiresAt: mockAPIKeyData.expiresAt,
      });
      expect(result.data).toEqual(mockAPIKeyData);
      expect(mockFetchApi).toHaveBeenCalledWith('/api-key/test-id', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'updated-key',
          expiresAt: mockAPIKeyData.expiresAt,
        }),
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(
        api.updateAPIKey('test-id', {
          name: 'updated-key',
          expiresAt: new Date().toISOString(),
        })
      ).rejects.toThrow('Failed to update API key: API Error');
    });
  });

  describe('deleteAPIKey', () => {
    it('should delete API key', async () => {
      mockFetchApi.mockResolvedValueOnce(mockResponse(undefined));

      await api.deleteAPIKey('test-id');
      expect(mockFetchApi).toHaveBeenCalledWith('/api-key/test-id', {
        method: 'DELETE',
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(api.deleteAPIKey('test-id')).rejects.toThrow(
        'Failed to delete API key: API Error'
      );
    });
  });
});
