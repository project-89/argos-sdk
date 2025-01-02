import { jest } from '@jest/globals';
import { ArgosServerSDK } from '../../../server/sdk/ArgosServerSDK';
import { SecureStorage } from '../../../server/storage/SecureStorage';
import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';
import type { Fingerprint } from '../../../shared/interfaces/api';

describe('ArgosServerSDK', () => {
  let sdk: ArgosServerSDK;
  let storage: SecureStorage;
  let environment: NodeEnvironment;

  beforeEach(() => {
    storage = new SecureStorage({
      encryptionKey: 'test-key-32-chars-secure-storage-ok',
      storagePath: './test-storage/storage.enc',
    });
    environment = new NodeEnvironment(storage, 'test-fingerprint');

    sdk = new ArgosServerSDK({
      baseUrl: 'http://test.com',
      apiKey: 'test-key',
      environment,
      fingerprint: 'test-fingerprint',
      debug: true,
    });
  });

  describe('identify', () => {
    it('should create a fingerprint', async () => {
      const mockFingerprint: Fingerprint = {
        id: 'test-id',
        fingerprint: 'test-fingerprint',
        roles: [],
        createdAt: { _seconds: 0, _nanoseconds: 0 },
        metadata: {},
        ipAddresses: [],
        ipMetadata: {
          ipFrequency: {},
          lastSeenAt: {},
          primaryIp: '',
          suspiciousIps: [],
        },
        tags: [],
      };

      jest
        .spyOn(sdk['fingerprintAPI'], 'createFingerprint')
        .mockResolvedValueOnce({
          success: true,
          data: mockFingerprint,
        });

      const result = await sdk.identify({
        fingerprint: 'test-fingerprint',
        metadata: { test: 'data' },
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFingerprint);
      expect(sdk['fingerprintAPI'].createFingerprint).toHaveBeenCalledWith(
        'test-fingerprint',
        { metadata: { test: 'data' } }
      );
    });
  });

  describe('getIdentity', () => {
    it('should get a fingerprint', async () => {
      const mockFingerprint: Fingerprint = {
        id: 'test-id',
        fingerprint: 'test-fingerprint',
        roles: [],
        createdAt: { _seconds: 0, _nanoseconds: 0 },
        metadata: {},
        ipAddresses: [],
        ipMetadata: {
          ipFrequency: {},
          lastSeenAt: {},
          primaryIp: '',
          suspiciousIps: [],
        },
        tags: [],
      };

      jest
        .spyOn(sdk['fingerprintAPI'], 'getFingerprint')
        .mockResolvedValueOnce({
          success: true,
          data: mockFingerprint,
        });

      const result = await sdk.getIdentity('test-id');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFingerprint);
      expect(sdk['fingerprintAPI'].getFingerprint).toHaveBeenCalledWith(
        'test-id'
      );
    });
  });

  describe('updateFingerprint', () => {
    it('should update fingerprint metadata', async () => {
      const mockFingerprint: Fingerprint = {
        id: 'test-id',
        fingerprint: 'test-fingerprint',
        roles: [],
        createdAt: { _seconds: 0, _nanoseconds: 0 },
        metadata: { test: 'updated' },
        ipAddresses: [],
        ipMetadata: {
          ipFrequency: {},
          lastSeenAt: {},
          primaryIp: '',
          suspiciousIps: [],
        },
        tags: [],
      };

      jest
        .spyOn(sdk['fingerprintAPI'], 'updateFingerprint')
        .mockResolvedValueOnce({
          success: true,
          data: mockFingerprint,
        });

      const result = await sdk.updateFingerprint('test-fingerprint', {
        test: 'updated',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFingerprint);
      expect(sdk['fingerprintAPI'].updateFingerprint).toHaveBeenCalledWith(
        'test-fingerprint',
        { test: 'updated' }
      );
    });
  });
});
