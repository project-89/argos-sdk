import { jest } from '@jest/globals';
import { ArgosServerSDK } from '../../../server/sdk/ArgosServerSDK';
import { ArgosClientSDK } from '../../../client/sdk/ArgosClientSDK';
import { RuntimeEnvironment } from '../../../shared/interfaces/environment';
import {
  MockBrowserEnvironment,
  MockNodeEnvironment,
  createMockResponse,
} from '../../../__tests__/utils/testUtils';
import type { Fingerprint } from '../../../shared/interfaces/api';

describe('SDK Interface', () => {
  let clientSDK: ArgosClientSDK;
  let serverSDK: ArgosServerSDK;
  let browserEnvironment: MockBrowserEnvironment;
  let nodeEnvironment: MockNodeEnvironment;

  beforeEach(() => {
    browserEnvironment = new MockBrowserEnvironment('test-fingerprint');
    nodeEnvironment = new MockNodeEnvironment('test-fingerprint');

    // Initialize SDKs with appropriate environments
    serverSDK = new ArgosServerSDK({
      baseUrl: 'https://test.example.com',
      environment: nodeEnvironment,
    });

    clientSDK = new ArgosClientSDK({
      baseUrl: 'https://test.example.com',
      environment: browserEnvironment,
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
        .spyOn(browserEnvironment, 'getFingerprint')
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
      expect(browserEnvironment.getFingerprint).toHaveBeenCalled();
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
      nodeEnvironment.setApiKey(apiKey);

      const sdk = new ArgosServerSDK({
        baseUrl: 'https://test.example.com',
        environment: nodeEnvironment,
      });

      jest.spyOn(nodeEnvironment, 'fetch').mockImplementation(async () => {
        return {
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () =>
            Promise.resolve({ success: false, message: 'API key revoked' }),
          text: () => Promise.resolve('API key revoked'),
        } as any;
      });

      await expect(sdk.revokeApiKey({ key: apiKey })).rejects.toThrow();
      expect(nodeEnvironment.fetch).toHaveBeenCalled();
      expect(sdk.getApiKey()).toBeUndefined();
    });
  });
});
