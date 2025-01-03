import { jest } from '@jest/globals';
import { ArgosServerSDK } from '../../../server/sdk/ArgosServerSDK';
import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';
import { SecureStorage } from '../../../server/storage/SecureStorage';

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

  const createMockResponse = (data: any) => ({
    ok: true,
    headers: new Map([['content-type', 'application/json']]),
    json: () => Promise.resolve(data),
  });

  describe('Impression Creation', () => {
    it('should create impressions with fingerprint in options', async () => {
      const testFingerprint = 'test-fingerprint';
      const mockResponse = { success: true, data: { id: '123' } };

      jest
        .spyOn(environment, 'fetch')
        .mockResolvedValue(createMockResponse(mockResponse) as any);

      const result = await sdk.track('test-event', {
        fingerprintId: testFingerprint,
        url: 'https://example.com',
        title: 'Test Page',
        metadata: { test: 'data' },
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
            type: 'test-event',
            fingerprintId: testFingerprint,
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
      };

      jest
        .spyOn(environment, 'fetch')
        .mockResolvedValue(createMockResponse(mockResponse) as any);

      const result = await sdk.getImpressions(testFingerprint);

      expect(result).toEqual(mockResponse);
      expect(environment.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/impressions/test-fingerprint',
        {
          method: 'GET',
          headers: expect.objectContaining({
            'content-type': 'application/json',
            'x-api-key': 'test-api-key',
          }),
        }
      );
    });
  });
});
