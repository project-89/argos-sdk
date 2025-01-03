import { jest } from '@jest/globals';
import { ArgosServerSDK } from '../../../server/sdk/ArgosServerSDK';
import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';
import { SecureStorage } from '../../../server/storage/SecureStorage';

describe('SDK Interface', () => {
  let sdk: ArgosServerSDK;
  let environment: NodeEnvironment;
  let storage: SecureStorage;

  beforeEach(() => {
    storage = new SecureStorage({
      encryptionKey: 'test-key-32-chars-secure-storage-ok',
    });
    environment = new NodeEnvironment(storage);

    sdk = new ArgosServerSDK({
      baseUrl: 'http://localhost:3000',
      apiKey: 'test-api-key',
      environment,
      encryptionKey: 'test-key-32-chars-secure-storage-ok',
    });
  });

  const createMockResponse = (data: any) => ({
    ok: true,
    headers: new Map([['content-type', 'application/json']]),
    json: () => Promise.resolve(data),
  });

  const createErrorResponse = (data: any) => ({
    ok: false,
    headers: new Map([['content-type', 'application/json']]),
    json: () => Promise.resolve(data),
  });

  describe('API Key Management', () => {
    it('should handle API key operations', async () => {
      const testFingerprint = 'test-fingerprint';
      const mockKeyResponse = {
        success: true,
        data: {
          key: 'dGVzdC1hcGkta2V5LTMyLWNoYXJzLXNlY3VyZS1zdG9yYWdl',
        },
      };
      const mockValidateResponse = { success: true, data: { valid: true } };

      jest
        .spyOn(environment, 'fetch')
        .mockResolvedValueOnce(createMockResponse(mockKeyResponse) as any)
        .mockResolvedValueOnce(createMockResponse(mockValidateResponse) as any);

      // Register API key
      const keyResult = await sdk.registerApiKey(testFingerprint);
      expect(keyResult).toEqual(mockKeyResponse);
      expect(environment.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api-key/register',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'content-type': 'application/json',
            'user-agent': expect.any(String),
          }),
          body: expect.objectContaining({
            fingerprintId: testFingerprint,
            metadata: expect.objectContaining({
              source: 'server-sdk',
            }),
          }),
          skipAuth: true,
        })
      );

      // Validate API key
      const validateResult = await sdk.validateAPIKey(mockKeyResponse.data.key);
      expect(validateResult).toEqual(mockValidateResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const testFingerprint = 'test-fingerprint';
      const mockError = { success: false, error: 'API Error' };

      jest
        .spyOn(environment, 'fetch')
        .mockResolvedValue(createErrorResponse(mockError) as any);

      await expect(sdk.registerApiKey(testFingerprint)).rejects.toThrow();
    });

    it('should handle invalid API key format', async () => {
      await expect(sdk.validateAPIKey('')).rejects.toThrow();
    });
  });
});
