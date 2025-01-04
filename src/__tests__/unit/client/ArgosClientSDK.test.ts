/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { ArgosClientSDK } from '../../../client/sdk/ArgosClientSDK';
import { RuntimeEnvironment } from '../../../shared/interfaces/environment';
import { MockBrowserEnvironment } from '../../utils/testUtils';
import { createMockResponse } from '../../utils/testUtils';
import type { TrackOptions } from '../../../client/sdk/ArgosClientSDK';

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
  let environment: MockBrowserEnvironment;
  const rateLimit = {
    limit: '999',
    remaining: '999',
    reset: Date.now().toString(),
  };

  beforeEach(() => {
    environment = new MockBrowserEnvironment('test-fingerprint');
    environment.type = RuntimeEnvironment.Browser;

    const mockFetch = jest.fn((url: string, options?: RequestInit) => {
      const mockResponse = createMockResponse(
        { id: 'test-id', metadata: {} },
        { rateLimit }
      );
      return Promise.resolve(mockResponse);
    });
    environment.fetch = mockFetch as unknown as (
      url: string,
      options?: RequestInit
    ) => Promise<Response>;

    sdk = new ArgosClientSDK({
      baseUrl: 'http://localhost:3000',
      environment,
      maxRequestsPerHour: 1000,
      maxRequestsPerMinute: 100,
    });
  });

  describe('identify', () => {
    it('should create a fingerprint', async () => {
      const result = await sdk.identify({});
      expect(result.rateLimitInfo).toEqual({
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
        reset: expect.any(String),
      });
      expect(result.data).toEqual({ id: 'test-id', metadata: {} });
      expect(result.success).toBe(true);
    });
  });

  describe('getIdentity', () => {
    it('should get a fingerprint', async () => {
      const result = await sdk.getIdentity('123');
      expect(result.rateLimitInfo).toEqual({
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
        reset: expect.any(String),
      });
      expect(result.data).toEqual({ id: 'test-id', metadata: {} });
      expect(result.success).toBe(true);
    });
  });

  describe('updateFingerprint', () => {
    it('should update fingerprint metadata', async () => {
      const result = await sdk.updateFingerprint('123', { test: 'data' });
      expect(result.rateLimitInfo).toEqual({
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
        reset: expect.any(String),
      });
      expect(result.data).toEqual({ id: 'test-id', metadata: {} });
      expect(result.success).toBe(true);
    });
  });

  describe('updatePresence', () => {
    it('should update presence status with current page info', async () => {
      const result = await sdk.updatePresence('test-fingerprint', 'online');
      expect(result.rateLimitInfo).toEqual({
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
        reset: expect.any(String),
      });
      expect(result.data).toEqual({ id: 'test-id', metadata: {} });
      expect(result.success).toBe(true);
    });

    it('should throw error when used in non-browser environment', async () => {
      const nodeEnv = new MockBrowserEnvironment('test-fingerprint');
      nodeEnv.type = RuntimeEnvironment.Node;

      const nodeSDK = new ArgosClientSDK({
        baseUrl: 'http://localhost:3000',
        environment: nodeEnv,
      });

      await expect(
        nodeSDK.updatePresence('test-fingerprint', 'online')
      ).rejects.toThrow(
        'updatePresence is only available in browser environments'
      );
    });
  });

  describe('track', () => {
    it('should create an impression with provided data', async () => {
      const trackOptions: TrackOptions = {
        fingerprintId: 'test-fingerprint',
        metadata: { test: 'data' },
      };

      const result = await sdk.track('test-event', trackOptions);
      expect(result.rateLimitInfo).toEqual({
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
        reset: expect.any(String),
      });
      expect(result.data).toEqual({ id: 'test-id', metadata: {} });
      expect(result.success).toBe(true);
    });

    it('should throw error when used in non-browser environment', async () => {
      const nodeEnv = new MockBrowserEnvironment('test-fingerprint');
      nodeEnv.type = RuntimeEnvironment.Node;

      const nodeSDK = new ArgosClientSDK({
        baseUrl: 'http://localhost:3000',
        environment: nodeEnv,
      });

      await expect(
        nodeSDK.track('test-event', { fingerprintId: 'test-fingerprint' })
      ).rejects.toThrow('track is only available in browser environments');
    });
  });
});
