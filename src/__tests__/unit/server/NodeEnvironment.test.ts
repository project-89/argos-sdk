import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';
import { SecureStorage } from '../../../server/storage/SecureStorage';
import { RuntimeEnvironment } from '../../../shared/interfaces/environment';

describe('NodeEnvironment', () => {
  let environment: NodeEnvironment;
  let storage: SecureStorage;

  beforeEach(() => {
    storage = new SecureStorage({
      encryptionKey: 'test-key-32-chars-secure-storage-ok',
    });
    environment = new NodeEnvironment(storage);
  });

  describe('API key management', () => {
    it('should set and get API key', () => {
      const apiKey = 'test-api-key';
      environment.setApiKey(apiKey);
      expect(environment.getApiKey()).toBe(apiKey);
    });

    it('should throw error when setting empty API key', () => {
      expect(() => environment.setApiKey('')).toThrow(
        'API key cannot be empty'
      );
    });

    it('should handle API key update callback', () => {
      const onApiKeyUpdate = jest.fn();
      const env = new NodeEnvironment(storage, onApiKeyUpdate);
      const apiKey = 'test-api-key';
      env.setApiKey(apiKey);
      expect(onApiKeyUpdate).toHaveBeenCalledWith(apiKey);
    });
  });

  describe('Headers management', () => {
    it('should create headers with API key when available', () => {
      const apiKey = 'test-api-key';
      environment.setApiKey(apiKey);
      const headers = environment.createHeaders();
      expect(headers['x-api-key']).toBe(apiKey);
      expect(headers['content-type']).toBe('application/json');
    });

    it('should create headers without API key when not available', () => {
      const headers = environment.createHeaders();
      expect(headers['x-api-key']).toBe('');
      expect(headers['content-type']).toBe('application/json');
    });

    it('should include fingerprint in headers when provided', () => {
      const fingerprint = 'test-fingerprint';
      const headers = environment.createHeaders({}, fingerprint);
      expect(headers['x-fingerprint']).toBe(fingerprint);
    });
  });

  describe('Platform info', () => {
    it('should return platform information', async () => {
      const info = await environment.getPlatformInfo();
      expect(info.platform).toBe(process.platform);
      expect(info.runtime).toBe(RuntimeEnvironment.Node);
    });
  });

  describe('Environment type', () => {
    it('should be Node environment', () => {
      expect(environment.type).toBe(RuntimeEnvironment.Node);
    });
  });
});
