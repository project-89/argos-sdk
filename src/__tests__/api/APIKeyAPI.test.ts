import { jest } from '@jest/globals';
import type { APIKeyData } from '../../types/api';
import { createMockFetchApi, mockResponse } from '../utils/testUtils';
import { APIKeyAPI } from '../../api/APIKeyAPI';

// Mock BaseAPI
jest.mock('../../api/BaseAPI', () => {
  return {
    __esModule: true,
    BaseAPI: jest.fn().mockImplementation(() => ({
      fetchApi: jest.fn(),
    })),
  };
});

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
        body: JSON.stringify({ key: 'test-key' }),
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
    const mockResponse = {
      key: 'test-key',
      fingerprintId: 'test-fingerprint',
      expiresAt: '2024-01-01T00:00:00Z',
    };

    it('should register initial API key', async () => {
      mockFetchApi.mockResolvedValueOnce({ success: true, data: mockResponse });

      const result = await api.registerInitialApiKey('test-fingerprint', {
        source: 'test',
      });
      expect(result.data).toEqual(mockResponse);
      expect(mockFetchApi).toHaveBeenCalledWith('/api-key/register', {
        method: 'POST',
        body: JSON.stringify({
          fingerprintId: 'test-fingerprint',
          metadata: { source: 'test' },
          invalidateExisting: true,
        }),
        isPublic: true,
      });
    });
  });

  describe('createAPIKey', () => {
    it('should create API key', async () => {
      const mockAPIKeyData: APIKeyData = {
        key: 'test-key',
        fingerprintId: 'test-fingerprint',
        expiresAt: '2024-01-01T00:00:00Z',
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockAPIKeyData));

      const result = await api.createAPIKey({
        name: 'test-key',
      });
      expect(result.data).toEqual(mockAPIKeyData);
      expect(mockFetchApi).toHaveBeenCalledWith('/api-key', {
        method: 'POST',
        body: JSON.stringify({
          name: 'test-key',
        }),
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(
        api.createAPIKey({
          name: 'test-key',
        })
      ).rejects.toThrow('Failed to create API key: API Error');
    });
  });

  describe('getAPIKey', () => {
    it('should get API key', async () => {
      const mockAPIKeyData: APIKeyData = {
        key: 'test-key',
        fingerprintId: 'test-fingerprint',
        expiresAt: '2024-01-01T00:00:00Z',
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockAPIKeyData));

      const result = await api.getAPIKey('test-key');
      expect(result.data).toEqual(mockAPIKeyData);
      expect(mockFetchApi).toHaveBeenCalledWith('/api-key/test-key', {
        method: 'GET',
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(api.getAPIKey('test-key')).rejects.toThrow(
        'Failed to get API key: API Error'
      );
    });
  });

  describe('listAPIKeys', () => {
    it('should list API keys', async () => {
      const mockAPIKeys: APIKeyData[] = [
        {
          key: 'test-key',
          fingerprintId: 'test-fingerprint',
          expiresAt: '2024-01-01T00:00:00Z',
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
        key: 'test-key',
        fingerprintId: 'test-fingerprint',
        expiresAt: '2024-01-02T00:00:00Z',
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockAPIKeyData));

      const result = await api.updateAPIKey('test-key', {
        expiresAt: '2024-01-02T00:00:00Z',
      });
      expect(result.data).toEqual(mockAPIKeyData);
      expect(mockFetchApi).toHaveBeenCalledWith('/api-key/test-key', {
        method: 'PUT',
        body: JSON.stringify({
          expiresAt: '2024-01-02T00:00:00Z',
        }),
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(
        api.updateAPIKey('test-key', {
          expiresAt: '2024-01-02T00:00:00Z',
        })
      ).rejects.toThrow('Failed to update API key: API Error');
    });
  });

  describe('deleteAPIKey', () => {
    it('should delete API key', async () => {
      mockFetchApi.mockResolvedValueOnce(mockResponse(true));

      const result = await api.deleteAPIKey('test-key');
      expect(result.data).toBe(true);
      expect(mockFetchApi).toHaveBeenCalledWith('/api-key/test-key', {
        method: 'DELETE',
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(api.deleteAPIKey('test-key')).rejects.toThrow(
        'Failed to delete API key: API Error'
      );
    });
  });
});
