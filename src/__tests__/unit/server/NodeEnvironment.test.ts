import { jest } from '@jest/globals';
import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';
import { SecureStorage } from '../../../server/storage/SecureStorage';
import type { Response } from 'node-fetch';
import { RuntimeEnvironment } from '../../../shared/interfaces/environment';

describe('NodeEnvironment', () => {
  let environment: NodeEnvironment;
  let storage: SecureStorage;

  beforeEach(() => {
    storage = new SecureStorage({
      encryptionKey: 'test-key-32-chars-secure-storage-ok',
      storagePath: './test-storage/storage.enc',
    });
    environment = new NodeEnvironment(storage);
  });

  afterEach(() => {
    storage.clear();
  });

  describe('isOnline', () => {
    it('should return true', () => {
      expect(environment.isOnline()).toBe(true);
    });
  });

  describe('getUserAgent', () => {
    it('should return node user agent', () => {
      expect(environment.getUserAgent()).toContain('Node.js');
    });
  });

  describe('getLanguage', () => {
    it('should return system language', () => {
      const language = environment.getLanguage();
      expect(language).toMatch(/^en[-_]US/);
    });
  });

  describe('getPlatformInfo', () => {
    it('should return platform information', async () => {
      const info = await environment.getPlatformInfo();
      expect(info).toHaveProperty('platform');
      expect(info).toHaveProperty('arch');
      expect(info).toHaveProperty('version');
      expect(info).toHaveProperty('userAgent');
      expect(info).toHaveProperty('language');
      expect(info).toHaveProperty('online');
      expect(info.runtime).toBe(RuntimeEnvironment.Node);
    });
  });

  describe('getFingerprint', () => {
    it('should return a valid fingerprint', async () => {
      const fingerprint = await environment.getFingerprint();
      expect(fingerprint).toMatch(/^node-[a-f0-9]{64}$/);
    });
  });

  describe('getUrl', () => {
    it('should return null', () => {
      expect(environment.getUrl()).toBeNull();
    });
  });

  describe('getReferrer', () => {
    it('should return null', () => {
      expect(environment.getReferrer()).toBeNull();
    });
  });

  describe('handleResponse', () => {
    it('should handle JSON response', async () => {
      const mockJson = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ data: 'test' }));
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: mockJson,
      } as unknown as Response;

      const result = await environment.handleResponse(mockResponse);
      expect(result).toEqual({ data: 'test' });
    });

    it('should handle text response', async () => {
      const mockText = jest
        .fn()
        .mockImplementation(() => Promise.resolve('test'));
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('text/plain'),
        },
        text: mockText,
      } as unknown as Response;

      const result = await environment.handleResponse(mockResponse);
      expect(result).toBe('test');
    });

    it('should handle error response', async () => {
      const mockJson = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ error: 'test error' }));
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: mockJson,
      } as unknown as Response;

      await expect(environment.handleResponse(mockResponse)).rejects.toThrow();
    });

    it('should handle non-JSON error response', async () => {
      const mockJson = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error('Invalid JSON')));
      const mockText = jest
        .fn()
        .mockImplementation(() => Promise.resolve('Internal Server Error'));
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          get: jest.fn().mockReturnValue('text/plain'),
        },
        json: mockJson,
        text: mockText,
      } as unknown as Response;

      await expect(environment.handleResponse(mockResponse)).rejects.toThrow();
    });
  });

  describe('API key management', () => {
    beforeEach(() => {
      storage.clear();
    });

    it('should set and get API key', () => {
      environment.setApiKey('test-key');
      expect(environment.getApiKey()).toBe('test-key');
    });

    it('should throw error when setting empty API key', () => {
      expect(() => environment.setApiKey('')).toThrow();
    });
  });

  describe('createHeaders', () => {
    beforeEach(() => {
      storage.clear();
    });

    it('should create headers with API key', () => {
      environment.setApiKey('test-key');
      const headers = environment.createHeaders({
        'Content-Type': 'application/json',
      });

      expect(headers['x-api-key']).toBe('test-key');
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('should create headers without API key', () => {
      const headers = environment.createHeaders({
        'Content-Type': 'application/json',
      });

      expect(headers['x-api-key']).toBeUndefined();
      expect(headers['Content-Type']).toBe('application/json');
    });
  });
});
