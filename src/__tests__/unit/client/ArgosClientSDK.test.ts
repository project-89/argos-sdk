/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { ArgosClientSDK } from '../../../client/sdk/ArgosClientSDK';
import { BrowserEnvironment } from '../../../client/environment/BrowserEnvironment';
import { CookieStorage } from '../../../client/storage/CookieStorage';
import type { Fingerprint } from '../../../shared/interfaces/api';
import Cookies from 'js-cookie';

describe('ArgosClientSDK', () => {
  let sdk: ArgosClientSDK;
  let storage: CookieStorage;
  let environment: BrowserEnvironment;

  beforeEach(() => {
    // Clear any existing cookies
    const cookies = Cookies.get();
    Object.keys(cookies).forEach((key) => {
      Cookies.remove(key);
    });

    // Set up cookie storage with test-friendly options
    storage = new CookieStorage({
      secure: false,
      sameSite: 'strict',
      domain: 'localhost',
      path: '/',
    });
    environment = new BrowserEnvironment(storage);

    sdk = new ArgosClientSDK({
      baseUrl: 'http://test.com',
      apiKey: 'test-key',
      environment,
      debug: true,
    });
  });

  afterEach(() => {
    // Clean up cookies
    const cookies = Cookies.get();
    Object.keys(cookies).forEach((key) => {
      Cookies.remove(key);
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

  describe('browser-specific functionality', () => {
    it('should use browser fingerprinting when available', async () => {
      const mockFingerprint = 'browser-generated-fingerprint';
      const mockResponse = {
        id: 'test-id',
        fingerprint: mockFingerprint,
        roles: [],
        createdAt: { _seconds: 0, _nanoseconds: 0 },
        metadata: { test: 'data' },
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
        .spyOn(environment, 'getFingerprint')
        .mockResolvedValueOnce(mockFingerprint);

      jest
        .spyOn(sdk['fingerprintAPI'], 'createFingerprint')
        .mockResolvedValueOnce({
          success: true,
          data: mockResponse,
        });

      const result = await sdk.identify({
        metadata: { test: 'data' },
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(environment.getFingerprint).toHaveBeenCalled();
      expect(sdk['fingerprintAPI'].createFingerprint).toHaveBeenCalledWith(
        mockFingerprint,
        { metadata: { test: 'data' } }
      );
    });

    it('should handle browser storage of API key', () => {
      const newApiKey = 'new-test-key';
      sdk.setApiKey(newApiKey);

      // Debug logging
      console.log('All cookies:', Cookies.get());
      console.log('API Key from SDK:', sdk.getApiKey());
      console.log('API Key from cookie:', Cookies.get('argos_apiKey'));

      expect(Cookies.get('argos_apiKey')).toBe(newApiKey);
    });

    it('should include browser-specific data in platform info', async () => {
      const platformInfo = await environment.getPlatformInfo();
      expect(platformInfo.platform).toBe('browser');
      expect(platformInfo.userAgent).toBeDefined();
      expect(platformInfo.language).toBeDefined();
    });
  });
});
