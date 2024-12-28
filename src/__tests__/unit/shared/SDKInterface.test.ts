import { jest } from '@jest/globals';
import { ArgosServerSDK } from '../../../server/sdk/ArgosServerSDK';
import { ArgosClientSDK } from '../../../client/sdk/ArgosClientSDK';
import {
  MockEnvironment,
  createMockResponse,
} from '../../../__tests__/utils/testUtils';
import type { Fingerprint } from '../../../shared/interfaces/api';

describe('SDK Interface', () => {
  let clientSDK: ArgosClientSDK;
  let serverSDK: ArgosServerSDK;
  let mockEnvironment: MockEnvironment;

  beforeEach(() => {
    mockEnvironment = new MockEnvironment('test-fingerprint');

    // Initialize both SDKs with mock environment
    serverSDK = new ArgosServerSDK({
      baseUrl: 'https://test.example.com',
      environment: mockEnvironment,
    });

    clientSDK = new ArgosClientSDK({
      baseUrl: 'https://test.example.com',
      environment: mockEnvironment,
      debug: true,
    });
  });

  describe('Environment-specific behavior', () => {
    it('should use provided fingerprint in server SDK', async () => {
      const mockFingerprint = 'test-fingerprint';
      const spy = jest.spyOn(serverSDK['fingerprintAPI'], 'createFingerprint');

      await serverSDK.identify({
        fingerprint: mockFingerprint,
        metadata: { test: true },
      });

      expect(spy).toHaveBeenCalledWith(mockFingerprint, {
        metadata: { test: true },
      });
    });

    it('should use auto-generated fingerprint in client SDK when not provided', async () => {
      const mockFingerprint = 'browser-generated-fingerprint';
      const mockResponse: Fingerprint = {
        id: 'test-id',
        fingerprint: mockFingerprint,
        roles: [],
        createdAt: { _seconds: 0, _nanoseconds: 0 },
        metadata: { test: true },
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
        .spyOn(mockEnvironment, 'getFingerprint')
        .mockResolvedValueOnce(mockFingerprint);

      jest
        .spyOn(clientSDK['fingerprintAPI'], 'createFingerprint')
        .mockResolvedValueOnce({
          success: true,
          data: mockResponse,
        });

      const result = await clientSDK.identify({
        metadata: { test: true },
      });

      expect(result.success).toBe(true);
      expect(result.data.fingerprint).toBe(mockFingerprint);
      expect(mockEnvironment.getFingerprint).toHaveBeenCalled();
    });
  });

  describe('Common SDK functionality', () => {
    it('should handle API key updates', async () => {
      const newApiKey = 'new-test-key';
      serverSDK.setApiKey(newApiKey);
      clientSDK.setApiKey(newApiKey);

      expect(serverSDK.getApiKey()).toBe(newApiKey);
      expect(clientSDK.getApiKey()).toBe(newApiKey);
    });

    it('should handle API key revocation', async () => {
      const apiKey = 'test-key';
      mockEnvironment.setApiKey(apiKey);

      const sdk = new ArgosServerSDK({
        baseUrl: 'https://test.example.com',
        environment: mockEnvironment,
      });

      jest.spyOn(mockEnvironment, 'fetch').mockImplementation(async () => {
        return createMockResponse({
          status: 401,
          statusText: 'Unauthorized',
          headers: { 'content-type': 'application/json' },
          body: { success: false, message: 'API key revoked' },
        });
      });

      await expect(sdk.revokeApiKey({ key: apiKey })).rejects.toThrow();
      expect(mockEnvironment.fetch).toHaveBeenCalled();
      expect(sdk.getApiKey()).toBeUndefined();
    });

    it('should handle getIdentity across environments', async () => {
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

      // Test both SDKs with the same mock response
      jest
        .spyOn(serverSDK['fingerprintAPI'], 'getFingerprint')
        .mockResolvedValueOnce({
          success: true,
          data: mockFingerprint,
        });

      jest
        .spyOn(clientSDK['fingerprintAPI'], 'getFingerprint')
        .mockResolvedValueOnce({
          success: true,
          data: mockFingerprint,
        });

      const serverResult = await serverSDK.getIdentity('test-id');
      const clientResult = await clientSDK.getIdentity('test-id');

      expect(serverResult.success).toBe(true);
      expect(clientResult.success).toBe(true);
      expect(serverResult.data).toEqual(mockFingerprint);
      expect(clientResult.data).toEqual(mockFingerprint);
    });

    it('should handle updateFingerprint across environments', async () => {
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

      // Test both SDKs with the same mock response
      jest
        .spyOn(serverSDK['fingerprintAPI'], 'updateFingerprint')
        .mockResolvedValueOnce({
          success: true,
          data: mockFingerprint,
        });

      jest
        .spyOn(clientSDK['fingerprintAPI'], 'updateFingerprint')
        .mockResolvedValueOnce({
          success: true,
          data: mockFingerprint,
        });

      const serverResult = await serverSDK.updateFingerprint(
        'test-fingerprint',
        { test: 'updated' }
      );
      const clientResult = await clientSDK.updateFingerprint(
        'test-fingerprint',
        { test: 'updated' }
      );

      expect(serverResult.success).toBe(true);
      expect(clientResult.success).toBe(true);
      expect(serverResult.data.metadata).toEqual({ test: 'updated' });
      expect(clientResult.data.metadata).toEqual({ test: 'updated' });
    });

    it('should handle errors consistently across environments', async () => {
      // Test error handling for both SDKs
      jest.spyOn(mockEnvironment, 'fetch').mockImplementation(async () => {
        return createMockResponse({
          status: 500,
          statusText: 'Internal Server Error',
          headers: { 'content-type': 'application/json' },
          body: { success: false, message: 'Server error' },
        });
      });

      await expect(serverSDK.getIdentity('invalid-id')).rejects.toThrow();
      await expect(clientSDK.getIdentity('invalid-id')).rejects.toThrow();
    });
  });
});
