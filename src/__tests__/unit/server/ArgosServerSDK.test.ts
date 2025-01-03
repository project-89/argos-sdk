import { jest } from '@jest/globals';
import { ArgosServerSDK } from '../../../server/sdk/ArgosServerSDK';
import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';
import { SecureStorage } from '../../../server/storage/SecureStorage';
import { Response } from 'node-fetch';

describe('ArgosServerSDK', () => {
  let environment: NodeEnvironment;
  let sdk: ArgosServerSDK;
  let mockResponse: any;

  const createMockResponse = (data: any) => {
    const headers = {
      'content-type': 'application/json',
    };
    return new Response(JSON.stringify(data), {
      status: 200,
      headers,
    });
  };

  beforeEach(() => {
    environment = new NodeEnvironment('test-encryption-key');
    jest
      .spyOn(environment, 'fetch')
      .mockImplementation(async () => createMockResponse({ success: true }));
    sdk = new ArgosServerSDK({
      environment,
      baseUrl: 'http://localhost:3000',
      apiKey: 'test-api-key',
    });
    mockResponse = { success: true };
  });

  describe('Impression Management', () => {
    it('should track impressions with fingerprint in options', async () => {
      const result = await sdk.track('pageview', {
        fingerprintId: 'test-fingerprint',
        url: 'https://example.com',
        metadata: { custom: 'data' },
      });

      expect(result).toEqual(mockResponse);
      expect(environment.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/impressions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'content-type': 'application/json',
            'x-api-key': 'test-api-key',
          }),
          body: expect.objectContaining({
            type: 'pageview',
            fingerprintId: 'test-fingerprint',
            data: expect.objectContaining({
              url: 'https://example.com',
              custom: 'data',
            }),
          }),
        })
      );
    });
  });

  describe('API Key Management', () => {
    it('should register API key with fingerprint in options', async () => {
      const result = await sdk.registerApiKey('test-fingerprint');

      expect(result).toEqual(mockResponse);
      expect(environment.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api-key/register',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'content-type': 'application/json',
            'user-agent': expect.any(String),
          }),
          body: expect.objectContaining({
            fingerprintId: 'test-fingerprint',
            metadata: expect.objectContaining({
              source: 'server-sdk',
            }),
          }),
          skipAuth: true,
        })
      );
    });
  });
});
