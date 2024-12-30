/**
 * @jest-environment jsdom
 */

import {
  ArgosClientSDK,
  ClientSDKConfig,
} from '../../../client/sdk/ArgosClientSDK';
import { MockBrowserEnvironment } from '../../utils/testUtils';

// Mock FingerprintJS
jest.mock('@fingerprintjs/fingerprintjs', () => ({
  load: jest.fn().mockResolvedValue({
    get: jest.fn().mockResolvedValue({
      visitorId: 'test-visitor-id',
      components: {},
    }),
  }),
}));

// Add MessageChannel to global
global.MessageChannel = class MessageChannel {
  port1: any = { postMessage: jest.fn() };
  port2: any = { postMessage: jest.fn() };
};

describe('ArgosClientSDK', () => {
  let sdk: ArgosClientSDK;
  let mockEnvironment: MockBrowserEnvironment;

  beforeEach(() => {
    mockEnvironment = new MockBrowserEnvironment('test-fingerprint');
    const config: ClientSDKConfig = {
      baseUrl: 'http://test.com',
      apiKey: 'test-api-key',
      environment: mockEnvironment as any,
    };
    sdk = new ArgosClientSDK(config);
  });

  describe('identify', () => {
    it('should create a fingerprint', async () => {
      const result = await sdk.identify({ metadata: { test: 'data' } });
      expect(result.success).toBe(true);
    });
  });

  describe('getIdentity', () => {
    it('should get a fingerprint', async () => {
      const result = await sdk.getIdentity('test-fingerprint');
      expect(result.success).toBe(true);
    });
  });

  describe('updateFingerprint', () => {
    it('should update fingerprint metadata', async () => {
      const metadata = { key: 'value' };
      const result = await sdk.updateFingerprint('test-fingerprint', metadata);
      expect(result.success).toBe(true);
    });
  });
});
