import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';
import { EnvironmentFactory } from '../../../core/factory/EnvironmentFactory';
import { RuntimeEnvironment } from '../../../shared/interfaces/environment';
import { SecureStorage } from '../../../server/storage/SecureStorage';

describe('NodeEnvironment', () => {
  let environment: NodeEnvironment;

  beforeEach(() => {
    environment = new NodeEnvironment(
      new SecureStorage({
        encryptionKey: 'test-key-32-chars-secure-storage-ok',
        storagePath: './test-storage/storage.enc',
      })
    );
  });

  describe('getUserAgent', () => {
    it('should return a valid user agent string', () => {
      const userAgent = environment.getUserAgent();
      expect(userAgent).toContain('Node.js');
      expect(userAgent).toMatch(/\([^)]+\)/);
    });
  });

  describe('getFingerprint', () => {
    it('should generate a unique fingerprint', async () => {
      const fingerprint = await environment.getFingerprint();
      expect(fingerprint).toBeDefined();
      expect(fingerprint).toMatch(/^node-[a-f0-9]{64}$/);
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
      expect(info).toHaveProperty('runtime');
    });
  });

  describe('isOnline', () => {
    it('should return true', () => {
      expect(environment.isOnline()).toBe(true);
    });
  });

  describe('getLanguage', () => {
    it('should return a valid language code', () => {
      const language = environment.getLanguage();
      expect(language).toBeTruthy();
      expect(language).toMatch(/^[a-z]{2}(-[A-Z]{2}|_[A-Z]{2}\.UTF-8)?$/);
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

  describe('createHeaders', () => {
    it('should add user agent and content type headers', () => {
      const headers = environment.createHeaders({});
      expect(headers['user-agent']).toBeDefined();
      expect(headers['content-type']).toBe('application/json');
    });

    it('should include API key if set', () => {
      environment.setApiKey('test-key');
      const headers = environment.createHeaders({});
      expect(headers['x-api-key']).toBe('test-key');
    });
  });

  describe('handleResponse', () => {
    it('should handle JSON responses', async () => {
      const mockResponse = new Response(JSON.stringify({ test: true }), {
        headers: { 'content-type': 'application/json' },
      });
      const result = await environment.handleResponse(mockResponse);
      expect(result).toEqual({ test: true });
    });

    it('should handle text responses', async () => {
      const mockResponse = new Response('test', {
        headers: { 'content-type': 'text/plain' },
      });
      const result = await environment.handleResponse(mockResponse);
      expect(result).toBe('test');
    });

    it('should handle errors', async () => {
      const mockResponse = new Response(
        JSON.stringify({ error: 'test error' }),
        {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }
      );
      await expect(environment.handleResponse(mockResponse)).rejects.toThrow();
    });

    it('should handle 401 errors by removing API key', async () => {
      environment.setApiKey('test-key');
      const mockResponse = new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }
      );
      await expect(environment.handleResponse(mockResponse)).rejects.toThrow();
      expect(environment.getApiKey()).toBeUndefined();
    });
  });
});
