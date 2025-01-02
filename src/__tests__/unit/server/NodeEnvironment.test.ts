import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';
import { SecureStorage } from '../../../server/storage/SecureStorage';

describe('NodeEnvironment', () => {
  let environment: NodeEnvironment;
  let storage: SecureStorage;

  beforeEach(() => {
    storage = new SecureStorage({
      encryptionKey: 'test-key-32-chars-secure-storage-ok',
      storagePath: './test-storage/storage.enc',
    });
    environment = new NodeEnvironment(storage, 'test-fingerprint');
  });

  describe('isOnline', () => {
    it('should always return true', () => {
      expect(environment.isOnline()).toBe(true);
    });
  });

  describe('getUserAgent', () => {
    it('should return Node.js user agent', () => {
      expect(environment.getUserAgent()).toMatch(/^Node\.js\//);
    });
  });

  describe('getPlatformInfo', () => {
    it('should return platform information', async () => {
      const info = await environment.getPlatformInfo();
      expect(info.platform).toBe(process.platform);
      expect(info.arch).toBe(process.arch);
      expect(info.version).toBe(process.version);
    });
  });

  describe('API key management', () => {
    it('should set and get API key', () => {
      environment.setApiKey('test-key');
      expect(environment.getApiKey()).toBe('test-key');
    });

    it('should throw error when setting empty API key', () => {
      expect(() => environment.setApiKey('')).toThrow(
        'API key cannot be empty'
      );
    });
  });

  describe('Headers management', () => {
    it('should create headers with API key when available', () => {
      environment.setApiKey('test-key');
      const headers = environment.createHeaders();
      expect(headers['x-api-key']).toBe('test-key');
      expect(headers['user-agent']).toMatch(/^Node\.js\//);
    });

    it('should create headers without API key when not available', () => {
      const headers = environment.createHeaders();
      expect(headers['x-api-key']).toBe('');
      expect(headers['user-agent']).toMatch(/^Node\.js\//);
    });
  });

  describe('Fingerprint management', () => {
    it('should return the provided fingerprint', async () => {
      const fingerprint = await environment.getFingerprint();
      expect(fingerprint).toBe('test-fingerprint');
    });
  });

  describe('Constructor validation', () => {
    it('should throw error when fingerprint is not provided', () => {
      expect(() => new NodeEnvironment(storage, '')).toThrow(
        'Fingerprint is required for Node environment'
      );
    });
  });
});
