import { jest } from '@jest/globals';
import { APIKeyAPI } from '../../../shared/api/APIKeyAPI';
import { ArgosServerSDK } from '../../../server/sdk/ArgosServerSDK';
import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';
import { SecureStorage } from '../../../server/storage/SecureStorage';
import type { APIKeyData } from '../../../shared/interfaces/api';

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
      apiKey: 'test-key',
      environment,
      fingerprint: 'test-fingerprint',
      debug: true,
    });

    api = new APIKeyAPI({
      baseUrl: BASE_URL,
      environment,
    });
  });

  describe('createAPIKey', () => {
    it('should create API key', async () => {
      const mockAPIKey: APIKeyData = {
        key: 'test-key',
        fingerprintId: 'test-fingerprint',
        expiresAt: new Date().toISOString(),
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
      jest.spyOn(api['environment'], 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: async () => ({
          success: true,
          data: { isValid: true, needsRefresh: false },
        }),
      } as any);

      const result = await api.validateAPIKey('test-key');

      expect(result.success).toBe(true);
      expect(result.data.isValid).toBe(true);
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

      await expect(api.validateAPIKey('test-key')).rejects.toThrow(
        'API Key validation failed'
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

      const result = await api.revokeAPIKey({ key: 'test-key' });

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

      await expect(api.revokeAPIKey({ key: 'test-key' })).rejects.toThrow(
        'API Key revocation failed'
      );
    });
  });
});
