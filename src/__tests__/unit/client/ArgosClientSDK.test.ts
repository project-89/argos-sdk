/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import {
  ArgosClientSDK,
  ClientSDKConfig,
} from '../../../client/sdk/ArgosClientSDK';
import { MockBrowserEnvironment } from '../../utils/testUtils';

// Mock FingerprintJS
jest.mock('@fingerprintjs/fingerprintjs', () => ({
  load: () =>
    Promise.resolve({
      get: () => Promise.resolve({ visitorId: 'test-visitor-id' }),
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
      const mockResponse = { success: true, data: { id: '123' } };
      jest.spyOn(mockEnvironment, 'fetch').mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse),
      } as any);

      const result = await sdk.identify({});
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getIdentity', () => {
    it('should get a fingerprint', async () => {
      const mockResponse = { success: true, data: { id: '123' } };
      jest.spyOn(mockEnvironment, 'fetch').mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse),
      } as any);

      const result = await sdk.getIdentity('123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateFingerprint', () => {
    it('should update fingerprint metadata', async () => {
      const mockResponse = { success: true, data: { id: '123' } };
      jest.spyOn(mockEnvironment, 'fetch').mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse),
      } as any);

      const result = await sdk.updateFingerprint('123', { test: 'data' });
      expect(result).toEqual(mockResponse);
    });
  });
});
