import { jest } from '@jest/globals';
import { ArgosClientSDK } from '../../../client/sdk/ArgosClientSDK';
import { ArgosServerSDK } from '../../../server/sdk/ArgosServerSDK';
import { BrowserEnvironment } from '../../../client/environment/BrowserEnvironment';
import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';
import { SecureStorage } from '../../../server/storage/SecureStorage';

describe('SDK Interface', () => {
  let clientSDK: ArgosClientSDK;
  let serverSDK: ArgosServerSDK;
  let storage: SecureStorage;
  let nodeEnvironment: NodeEnvironment;
  let browserEnvironment: BrowserEnvironment;

  beforeEach(() => {
    storage = new SecureStorage({
      encryptionKey: 'test-key-32-chars-secure-storage-ok',
      storagePath: './test-storage/storage.enc',
    });
    nodeEnvironment = new NodeEnvironment(storage, 'test-fingerprint');
    browserEnvironment = new BrowserEnvironment();

    serverSDK = new ArgosServerSDK({
      baseUrl: 'https://test.example.com',
      environment: nodeEnvironment,
      fingerprint: 'test-fingerprint',
    });

    clientSDK = new ArgosClientSDK({
      baseUrl: 'https://test.example.com',
      environment: browserEnvironment,
    });
  });

  describe('Environment Detection', () => {
    it('should detect browser environment correctly', () => {
      expect(browserEnvironment.isOnline()).toBeDefined();
      expect(browserEnvironment.getUserAgent()).toBeDefined();
    });

    it('should detect node environment correctly', () => {
      expect(nodeEnvironment.isOnline()).toBe(true);
      expect(nodeEnvironment.getUserAgent()).toMatch(/^Node\.js\//);
    });
  });

  describe('API Key Management', () => {
    it('should handle API key in browser environment', () => {
      browserEnvironment.setApiKey('test-key');
      expect(browserEnvironment.getApiKey()).toBe('test-key');
    });

    it('should handle API key in node environment', () => {
      nodeEnvironment.setApiKey('test-key');
      expect(nodeEnvironment.getApiKey()).toBe('test-key');
    });

    it('should throw error for empty API key', () => {
      expect(() => browserEnvironment.setApiKey('')).toThrow(
        'API key cannot be empty'
      );
      expect(() => nodeEnvironment.setApiKey('')).toThrow(
        'API key cannot be empty'
      );
    });
  });

  describe('SDK Initialization', () => {
    it('should initialize client SDK with browser environment', () => {
      const sdk = new ArgosClientSDK({
        baseUrl: 'https://test.example.com',
        environment: browserEnvironment,
      });
      expect(sdk).toBeDefined();
    });

    it('should initialize server SDK with node environment', () => {
      const sdk = new ArgosServerSDK({
        baseUrl: 'https://test.example.com',
        environment: nodeEnvironment,
        fingerprint: 'test-fingerprint',
      });
      expect(sdk).toBeDefined();
    });

    it('should throw error when initializing server SDK without fingerprint', () => {
      expect(
        () =>
          new ArgosServerSDK({
            baseUrl: 'https://test.example.com',
            environment: nodeEnvironment,
            fingerprint: '',
          })
      ).toThrow('Fingerprint is required for server SDK');
    });
  });
});
