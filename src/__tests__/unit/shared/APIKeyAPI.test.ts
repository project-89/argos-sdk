import { jest } from '@jest/globals';
import { APIKeyAPI } from '../../../shared/api/APIKeyAPI';
import { ArgosServerSDK } from '../../../server/sdk/ArgosServerSDK';
import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';
import { SecureStorage } from '../../../server/storage/SecureStorage';
import type {
  APIKeyData,
  ValidateAPIKeyResponse,
} from '../../../shared/interfaces/api';

// Example encrypted API key (base64 encoded AES-256-CBC encrypted string)
const VALID_TEST_KEY = 'MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI=';
const ANOTHER_VALID_KEY = 'TmV3RW5jcnlwdGVkS2V5MTIzNDU2Nzg5MDEyMzQ1Njc4OTA=';

describe('APIKeyAPI', () => {
  const BASE_URL = 'http://test.com';
  let api: APIKeyAPI<any>;
  let serverSDK: ArgosServerSDK;
  let storage: SecureStorage;
  let environment: NodeEnvironment;

  beforeEach(() => {
    storage = new SecureStorage({
      encryptionKey: 'test-key-32-chars-secure-storage-ok',
      storagePath: './test-storage/storage.enc',
    });
    environment = new NodeEnvironment(storage, 'test-fingerprint');

    serverSDK = new ArgosServerSDK({
      baseUrl: BASE_URL,
      apiKey: VALID_TEST_KEY,
      environment,
      fingerprint: 'test-fingerprint',
      debug: true,
    });

    api = new APIKeyAPI({
      baseUrl: BASE_URL,
      environment,
      refreshThreshold: 3600000, // 1 hour
      autoRefresh: true,
    });
  });

  describe('createAPIKey', () => {
    it('should create API key', async () => {
      const mockAPIKey: APIKeyData = {
        key: VALID_TEST_KEY,
        fingerprintId: 'test-fingerprint',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
      };

      jest.spyOn(api['environment'], 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: async () => ({ success: true, data: mockAPIKey }),
      } as any);

      const result = await api.createAPIKey({
        name: 'test-key',
        fingerprintId: 'test-fingerprint',
        expiresAt: new Date().toISOString(),
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAPIKey);
    });

    it('should handle API errors', async () => {
      jest.spyOn(api['environment'], 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: async () => ({
          success: false,
          error: 'API Key creation failed',
        }),
      } as any);

      await expect(
        api.createAPIKey({
          name: 'test-key',
          fingerprintId: 'test-fingerprint',
          expiresAt: new Date().toISOString(),
        })
      ).rejects.toThrow('API Key creation failed');
    });
  });

  describe('validateAPIKey', () => {
    it('should validate API key', async () => {
      const mockValidation: ValidateAPIKeyResponse = {
        isValid: true,
        needsRefresh: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timeUntilExpiration: 24 * 60 * 60 * 1000,
        status: 'active',
      };

      jest.spyOn(api['environment'], 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: async () => ({
          success: true,
          data: mockValidation,
        }),
      } as any);

      const result = await api.validateAPIKey(VALID_TEST_KEY);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockValidation);
    });

    it('should auto-refresh when key is near expiration', async () => {
      const mockValidation: ValidateAPIKeyResponse = {
        isValid: true,
        needsRefresh: true,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        timeUntilExpiration: 30 * 60 * 1000,
        status: 'active',
      };

      const mockRefresh = {
        oldKey: VALID_TEST_KEY,
        newKey: ANOTHER_VALID_KEY,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const fetchMock = jest.spyOn(api['environment'], 'fetch');

      // Mock validate response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: mockValidation }),
      } as any);

      // Mock refresh response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: mockRefresh }),
      } as any);

      const result = await api.validateAPIKey(VALID_TEST_KEY);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockValidation);

      // Wait for auto-refresh to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(api['environment'].getApiKey()).toBe(mockRefresh.newKey);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('should handle API errors', async () => {
      jest.spyOn(api['environment'], 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: async () => ({
          success: false,
          error: 'API Key validation failed',
        }),
      } as any);

      await expect(api.validateAPIKey(VALID_TEST_KEY)).rejects.toThrow(
        'API Key validation failed'
      );
    });
  });

  describe('refreshAPIKey', () => {
    it('should refresh API key', async () => {
      const mockRefresh = {
        oldKey: VALID_TEST_KEY,
        newKey: ANOTHER_VALID_KEY,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      jest.spyOn(api['environment'], 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: async () => ({ success: true, data: mockRefresh }),
      } as any);

      const result = await api.refreshAPIKey(VALID_TEST_KEY);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRefresh);
    });

    it('should handle API errors', async () => {
      jest.spyOn(api['environment'], 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: async () => ({
          success: false,
          error: 'API Key refresh failed',
        }),
      } as any);

      await expect(api.refreshAPIKey(VALID_TEST_KEY)).rejects.toThrow(
        'API Key refresh failed'
      );
    });
  });

  describe('rotateAPIKey', () => {
    it('should rotate API key', async () => {
      const mockRotate = {
        oldKey: VALID_TEST_KEY,
        newKey: ANOTHER_VALID_KEY,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      jest.spyOn(api['environment'], 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: async () => ({ success: true, data: mockRotate }),
      } as any);

      const result = await api.rotateAPIKey(VALID_TEST_KEY);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRotate);
    });

    it('should handle API errors', async () => {
      jest.spyOn(api['environment'], 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: async () => ({
          success: false,
          error: 'API Key rotation failed',
        }),
      } as any);

      await expect(api.rotateAPIKey(VALID_TEST_KEY)).rejects.toThrow(
        'API Key rotation failed'
      );
    });
  });

  describe('revokeAPIKey', () => {
    it('should revoke API key', async () => {
      jest.spyOn(api['environment'], 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: async () => ({ success: true }),
      } as any);

      const result = await api.revokeAPIKey({ key: VALID_TEST_KEY });

      expect(result.success).toBe(true);
    });

    it('should handle API errors', async () => {
      jest.spyOn(api['environment'], 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: async () => ({
          success: false,
          error: 'API Key revocation failed',
        }),
      } as any);

      await expect(api.revokeAPIKey({ key: VALID_TEST_KEY })).rejects.toThrow(
        'API Key revocation failed'
      );
    });
  });

  describe('API Key Format Validation', () => {
    it('should reject empty API keys', async () => {
      await expect(api.validateAPIKey('')).rejects.toThrow(
        'API key must be a non-empty string'
      );
    });

    it('should reject invalid API key formats', async () => {
      await expect(api.validateAPIKey('short')).rejects.toThrow(
        'Invalid API key format'
      );
      await expect(
        api.validateAPIKey('invalid@characters#here')
      ).rejects.toThrow('Invalid API key format');
      await expect(api.validateAPIKey('not-base64!')).rejects.toThrow(
        'Invalid API key format'
      );
    });

    it('should accept valid API key formats', async () => {
      const mockValidation: ValidateAPIKeyResponse = {
        isValid: true,
        needsRefresh: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timeUntilExpiration: 24 * 60 * 60 * 1000,
        status: 'active',
      };

      const fetchMock = jest.spyOn(api['environment'], 'fetch');

      // Mock first validation response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: async () => ({
          success: true,
          data: mockValidation,
        }),
      } as any);

      // Mock second validation response
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: async () => ({
          success: true,
          data: mockValidation,
        }),
      } as any);

      await expect(api.validateAPIKey(VALID_TEST_KEY)).resolves.toBeDefined();
      await expect(
        api.validateAPIKey(ANOTHER_VALID_KEY)
      ).resolves.toBeDefined();

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('should validate new key format after refresh', async () => {
      const mockRefresh = {
        oldKey: VALID_TEST_KEY,
        newKey: 'not-base64!', // Invalid format
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      jest.spyOn(api['environment'], 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: async () => ({ success: true, data: mockRefresh }),
      } as any);

      await expect(api.refreshAPIKey(VALID_TEST_KEY)).rejects.toThrow(
        'Invalid API key format'
      );
    });

    it('should validate new key format after rotation', async () => {
      const mockRotate = {
        oldKey: VALID_TEST_KEY,
        newKey: 'not-base64!', // Invalid format
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      jest.spyOn(api['environment'], 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: async () => ({ success: true, data: mockRotate }),
      } as any);

      await expect(api.rotateAPIKey(VALID_TEST_KEY)).rejects.toThrow(
        'Invalid API key format'
      );
    });
  });
});
