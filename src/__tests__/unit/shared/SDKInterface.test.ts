import { jest } from '@jest/globals';
import { ArgosServerSDK } from '../../../server/sdk/ArgosServerSDK';
import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';
import { SecureStorage } from '../../../server/storage/SecureStorage';
import { Response } from 'node-fetch';

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

  const createMockResponse = (data: any) => {
    const mockHeaders = {
      get: jest.fn((key: string) => {
        const headers: Record<string, string> = {
          'content-type': 'application/json',
          'x-ratelimit-limit': '1000',
          'x-ratelimit-remaining': '999',
          'x-ratelimit-reset': Date.now().toString(),
        };
        return headers[key.toLowerCase()] || null;
      }),
    };

    const jsonString = JSON.stringify(data);
    const buffer = Buffer.from(jsonString);

    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: mockHeaders,
      size: buffer.length,
      timeout: 0,
      url: 'http://localhost:3000',
      redirected: false,
      type: 'default' as const,
      bodyUsed: false,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(jsonString),
      buffer: () => Promise.resolve(buffer),
      arrayBuffer: () => Promise.resolve(buffer.buffer),
      blob: () => Promise.resolve(new Blob([buffer])),
      formData: () => Promise.resolve(new FormData()),
      clone: function () {
        return createMockResponse(data);
      },
      body: null,
    };

    return response as unknown as Response;
  };

  const createErrorResponse = (data: any) => {
    const mockHeaders = {
      get: jest.fn((key: string) => {
        const headers: Record<string, string> = {
          'content-type': 'application/json',
          'x-ratelimit-limit': '1000',
          'x-ratelimit-remaining': '999',
          'x-ratelimit-reset': Date.now().toString(),
        };
        return headers[key.toLowerCase()] || null;
      }),
    };

    const jsonString = JSON.stringify(data);
    const buffer = Buffer.from(jsonString);

    const response = {
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: mockHeaders,
      size: buffer.length,
      timeout: 0,
      url: 'http://localhost:3000',
      redirected: false,
      type: 'default' as const,
      bodyUsed: false,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(jsonString),
      buffer: () => Promise.resolve(buffer),
      arrayBuffer: () => Promise.resolve(buffer.buffer),
      blob: () => Promise.resolve(new Blob([buffer])),
      formData: () => Promise.resolve(new FormData()),
      clone: function () {
        return createErrorResponse(data);
      },
      body: null,
    };

    return response as unknown as Response;
  };

  describe('API Key Management', () => {
    it('should handle API key operations', async () => {
      const testFingerprint = 'test-fingerprint';
      const mockKeyResponse = {
        success: true,
        data: {
          key: 'dGVzdC1hcGkta2V5LTMyLWNoYXJzLXNlY3VyZS1zdG9yYWdl',
        },
        rateLimitInfo: {
          limit: '1000',
          remaining: '999',
          reset: expect.any(String),
        },
      };

      jest
        .spyOn(environment, 'fetch')
        .mockResolvedValue(createMockResponse(mockKeyResponse));

      // Register API key
      const keyResult = await sdk.registerApiKey(testFingerprint);
      expect(keyResult).toMatchObject(mockKeyResponse);
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
