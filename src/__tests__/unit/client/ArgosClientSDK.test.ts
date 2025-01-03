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

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://test.com/page',
      },
      writable: true,
    });

    // Mock document.title
    Object.defineProperty(document, 'title', {
      value: 'Test Page',
      writable: true,
    });
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

  describe('updatePresence', () => {
    it('should update presence status with current page info', async () => {
      const mockResponse = {
        success: true,
        data: { timestamp: new Date().toISOString() },
      };
      const fetchSpy = jest.spyOn(mockEnvironment, 'fetch').mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse),
      } as any);

      const result = await sdk.updatePresence('test-fingerprint', 'online');

      expect(result).toEqual(mockResponse);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/visit/presence'),
        expect.objectContaining({
          method: 'POST',
          body: expect.objectContaining({
            fingerprintId: 'test-fingerprint',
            status: 'online',
            timestamp: expect.any(String),
            metadata: {
              url: 'http://test.com/page',
              title: 'Test Page',
            },
          }),
        })
      );
    });

    it('should throw error when used in non-browser environment', async () => {
      const windowSpy = jest.spyOn(global, 'window', 'get');
      windowSpy.mockImplementation(() => undefined as any);

      await expect(sdk.updatePresence('test-fingerprint')).rejects.toThrow(
        'Presence tracking is only available in browser environment'
      );

      windowSpy.mockRestore();
    });
  });

  describe('track', () => {
    it('should create an impression with provided data', async () => {
      const mockResponse = { success: true, data: { id: 'imp-123' } };
      const fetchSpy = jest.spyOn(mockEnvironment, 'fetch').mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse),
      } as any);

      const result = await sdk.track('page-view', {
        fingerprintId: 'test-fingerprint',
        url: 'http://test.com/page',
        title: 'Test Page',
        metadata: { custom: 'data' },
      });

      expect(result).toEqual(mockResponse);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/impressions'),
        expect.objectContaining({
          method: 'POST',
          body: expect.objectContaining({
            type: 'page-view',
            fingerprintId: 'test-fingerprint',
            data: {
              url: 'http://test.com/page',
              title: 'Test Page',
              custom: 'data',
            },
          }),
        })
      );
    });

    it('should throw error when used in non-browser environment', async () => {
      const windowSpy = jest.spyOn(global, 'window', 'get');
      windowSpy.mockImplementation(() => undefined as any);

      await expect(
        sdk.track('test-event', { fingerprintId: 'test-fingerprint' })
      ).rejects.toThrow('Tracking is only available in browser environment');

      windowSpy.mockRestore();
    });
  });
});
