import { jest } from '@jest/globals';
import { ArgosServerSDK } from '../../../server/sdk/ArgosServerSDK';
import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';
import { SecureStorage } from '../../../server/storage/SecureStorage';
import type { ImpressionData } from '../../../shared/interfaces/api';

describe('Impression Management', () => {
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
      baseUrl: 'http://test.com',
      apiKey: 'test-key',
      environment,
      fingerprint: 'test-fingerprint',
      debug: true,
    });
  });

  describe('createImpression', () => {
    it('should create impression', async () => {
      const mockImpression: ImpressionData = {
        id: 'test-id',
        fingerprintId: 'test-fingerprint',
        type: 'test',
        data: {},
        createdAt: new Date().toISOString(),
      };

      jest
        .spyOn(serverSDK['impressionAPI'], 'createImpression')
        .mockResolvedValueOnce({
          success: true,
          data: mockImpression,
        });

      const result = await serverSDK.createImpression({
        fingerprintId: 'test-fingerprint',
        type: 'test',
        data: {},
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockImpression);
    });
  });

  describe('getImpressions', () => {
    it('should get impressions', async () => {
      const mockImpressions: ImpressionData[] = [
        {
          id: 'test-id',
          fingerprintId: 'test-fingerprint',
          type: 'test',
          data: {},
          createdAt: new Date().toISOString(),
        },
      ];

      jest
        .spyOn(serverSDK['impressionAPI'], 'getImpressions')
        .mockResolvedValueOnce({
          success: true,
          data: mockImpressions,
        });

      const result = await serverSDK.getImpressions('test-fingerprint');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockImpressions);
    });
  });

  describe('deleteImpressions', () => {
    it('should delete impressions', async () => {
      jest
        .spyOn(serverSDK['impressionAPI'], 'deleteImpressions')
        .mockResolvedValueOnce({
          success: true,
          data: { deletedCount: 1 },
        });

      const result = await serverSDK.deleteImpressions('test-fingerprint');

      expect(result.success).toBe(true);
      expect(result.data.deletedCount).toBe(1);
    });
  });
});
