import { jest } from '@jest/globals';
import { ArgosServerSDK } from '../../../server/sdk/ArgosServerSDK';
import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';
import { SecureStorage } from '../../../server/storage/SecureStorage';
import { Response } from 'node-fetch';
import { Headers } from 'node-fetch';

describe('Impression Management', () => {
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

  describe('Impression Creation', () => {
    it('should create impressions with fingerprint in options', async () => {
      const testFingerprint = 'test-fingerprint';
      const mockResponse = {
        success: true,
        data: { id: '123' },
        rateLimitInfo: {
          limit: expect.any(String),
          remaining: expect.any(String),
          reset: expect.any(String),
        },
      };

      jest.spyOn(environment, 'fetch').mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({
            'content-type': 'application/json',
            'X-RateLimit-Limit': 'Infinity',
            'X-RateLimit-Remaining': 'Infinity',
            'X-RateLimit-Reset': Date.now().toString(),
          }),
          json: () => Promise.resolve(mockResponse),
          buffer: () => Promise.resolve(Buffer.from('')),
          size: 0,
          textConverted: () => Promise.resolve(''),
          timeout: 0,
        } as Response)
      );

      const result = await sdk.track('test-event', {
        fingerprintId: testFingerprint,
        url: 'https://example.com',
        title: 'Test Page',
        metadata: { test: 'data' },
      });

      expect(result).toMatchObject(mockResponse);
      expect(environment.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/impressions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'content-type': 'application/json',
            'x-api-key': 'test-api-key',
          }),
          body: expect.objectContaining({
            type: 'test-event',
            fingerprintId: 'test-fingerprint',
            data: expect.objectContaining({
              url: 'https://example.com',
              title: 'Test Page',
              test: 'data',
            }),
          }),
        })
      );
    });
  });

  describe('Impression Retrieval', () => {
    it('should get impressions with fingerprint in options', async () => {
      const testFingerprint = 'test-fingerprint';
      const mockResponse = {
        success: true,
        data: [{ id: '123', type: 'test' }],
        rateLimitInfo: {
          limit: expect.any(String),
          remaining: expect.any(String),
          reset: expect.any(String),
        },
      };

      jest.spyOn(environment, 'fetch').mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({
            'content-type': 'application/json',
            'X-RateLimit-Limit': 'Infinity',
            'X-RateLimit-Remaining': 'Infinity',
            'X-RateLimit-Reset': Date.now().toString(),
          }),
          json: () => Promise.resolve(mockResponse),
          buffer: () => Promise.resolve(Buffer.from('')),
          size: 0,
          textConverted: () => Promise.resolve(''),
          timeout: 0,
        } as Response)
      );

      const result = await sdk.getImpressions(testFingerprint);

      expect(result).toMatchObject(mockResponse);
      expect(environment.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/impressions/test-fingerprint',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });
});
