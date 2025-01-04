/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';
import { SecureStorage } from '../../../server/storage/SecureStorage';
import { RuntimeEnvironment } from '../../../shared/interfaces/environment';
import { Headers } from 'node-fetch';
import type { ApiResponse } from '../../../shared/interfaces/api';

jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(false),
  readFileSync: jest.fn().mockReturnValue(''),
  writeFileSync: jest.fn().mockReturnValue(undefined),
  mkdirSync: jest.fn().mockReturnValue(undefined),
  mkdtempSync: jest.fn().mockReturnValue('/tmp/test-dir'),
  rmSync: jest.fn().mockReturnValue(undefined),
}));

describe('NodeEnvironment', () => {
  let environment: NodeEnvironment;
  let storage: SecureStorage;

  beforeEach(() => {
    jest.clearAllMocks();
    storage = new SecureStorage({
      encryptionKey: 'test-key-32-chars-secure-storage-ok',
      storagePath: '/tmp/test-dir/storage.enc',
    });
    environment = new NodeEnvironment(storage);
  });

  describe('API key management', () => {
    it('should set and get API key', async () => {
      await environment.setApiKey('test-api-key');
      expect(environment.getApiKey()).toBe('test-api-key');
    });

    it('should throw error when setting empty API key', async () => {
      await expect(environment.setApiKey('')).rejects.toThrow(
        'API key cannot be empty'
      );
    });

    it('should handle API key update callback', async () => {
      const onApiKeyUpdate = jest.fn();
      environment = new NodeEnvironment(storage, onApiKeyUpdate);
      await environment.setApiKey('test-api-key');
      expect(onApiKeyUpdate).toHaveBeenCalledWith('test-api-key');
    });
  });

  describe('Headers management', () => {
    it('should create headers with API key when available', () => {
      environment.setApiKey('test-api-key');
      const headers = environment.createHeaders();
      expect(headers['x-api-key']).toBe('test-api-key');
    });

    it('should create headers without API key when not available', () => {
      const headers = environment.createHeaders();
      expect(headers['x-api-key']).toBe('');
    });

    it('should include fingerprint in headers when provided', () => {
      const headers = environment.createHeaders({}, 'test-fingerprint');
      expect(headers['x-fingerprint']).toBe('test-fingerprint');
    });
  });

  describe('Response Handling', () => {
    it('should include rate limit information in successful responses', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
          'X-RateLimit-Limit': '1000',
          'X-RateLimit-Remaining': '999',
          'X-RateLimit-Reset': '60',
        }),
        json: async () => ({
          success: true,
          data: { test: true },
        }),
      };

      const result = await environment.handleResponse<
        ApiResponse<{ test: boolean }>
      >(mockResponse as any);
      expect(result).toHaveProperty('rateLimitInfo');
      expect(result.rateLimitInfo).toEqual({
        limit: '1000',
        remaining: '999',
        reset: '60',
      });
    });

    it('should handle rate limit exceeded errors', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        headers: new Headers({
          'content-type': 'application/json',
          'retry-after': '60',
          'X-RateLimit-Limit': '1000',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': '60',
        }),
        json: async () => ({
          success: false,
          error: 'Rate limit exceeded',
        }),
      };

      try {
        await environment.handleResponse(mockResponse as any);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Rate limit exceeded');
        const errorData = JSON.parse(error.message);
        expect(errorData).toEqual({
          error: 'Rate limit exceeded',
          retryAfter: '60',
          rateLimitInfo: {
            limit: '1000',
            remaining: '0',
            reset: '60',
          },
          details: expect.any(Object),
        });
      }
    });

    it('should not include rate limit info when headers are not present', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
        }),
        json: async () => ({
          success: true,
          data: { test: true },
        }),
      };

      const result = await environment.handleResponse<
        ApiResponse<{ test: boolean }>
      >(mockResponse as any);
      expect(result.rateLimitInfo).toBeUndefined();
    });

    it('should include retry-after in rate limit error responses', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        headers: new Headers({
          'content-type': 'application/json',
          'retry-after': '60',
          'X-RateLimit-Limit': '1000',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': '60',
        }),
        json: async () => ({
          success: false,
          error: 'Rate limit exceeded',
          rateLimitInfo: {
            limit: '1000',
            remaining: '0',
            reset: '60',
          },
        }),
      };

      try {
        await environment.handleResponse(mockResponse as any);
        fail('Should have thrown an error');
      } catch (error: any) {
        const errorData = JSON.parse(error.message);
        expect(errorData.retryAfter).toBe('60');
        expect(errorData.rateLimitInfo).toEqual({
          limit: '1000',
          remaining: '0',
          reset: '60',
        });
      }
    });
  });

  describe('Platform info', () => {
    it('should return platform information', async () => {
      const info = await environment.getPlatformInfo();
      expect(info).toEqual(
        expect.objectContaining({
          platform: process.platform,
          runtime: RuntimeEnvironment.Node,
        })
      );
    });
  });

  describe('Environment type', () => {
    it('should be Node environment', () => {
      expect(environment.type).toBe(RuntimeEnvironment.Node);
    });
  });
});
