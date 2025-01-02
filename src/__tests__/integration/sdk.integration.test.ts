/**
 * @jest-environment jsdom
 */

import { ArgosClientSDK } from '../../client/sdk/ArgosClientSDK';
import { ArgosServerSDK } from '../../server/sdk/ArgosServerSDK';
import { BrowserEnvironment } from '../../client/environment/BrowserEnvironment';
import { NodeEnvironment } from '../../server/environment/NodeEnvironment';
import { SecureStorage } from '../../server/storage/SecureStorage';
import fetch from 'node-fetch';

// Set up fetch for jsdom environment
global.fetch = fetch as unknown as typeof global.fetch;

// Set up missing browser APIs
class MessageChannel {
  port1: any;
  port2: any;
  constructor() {
    this.port1 = { postMessage: jest.fn() };
    this.port2 = { postMessage: jest.fn() };
  }
}
global.MessageChannel = MessageChannel as any;

// Mock canvas for fingerprint generation
class CanvasRenderingContext2D {
  canvas: HTMLCanvasElement;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }
  measureText() {
    return { width: 100 };
  }
  fillText() {
    // Mock implementation
    return;
  }
  fillRect() {
    // Mock implementation
    return;
  }
  getImageData() {
    return { data: new Uint8Array(400) };
  }
}

HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement) {
  return new CanvasRenderingContext2D(this);
} as any;

describe('SDK Integration Tests', () => {
  const API_URL =
    process.env.ARGOS_API_URL ||
    'http://localhost:5001/argos-434718/us-central1/api';
  const TEST_FINGERPRINT = 'test-server-fingerprint';
  let clientSDK: ArgosClientSDK;
  let serverSDK: ArgosServerSDK;
  let clientEnvironment: BrowserEnvironment;
  let serverEnvironment: NodeEnvironment;
  let storage: SecureStorage;
  let fingerprintId: string;
  let apiKey: string;

  beforeAll(async () => {
    try {
      // Set up storage
      storage = new SecureStorage({
        encryptionKey: 'test-key-32-chars-secure-storage-ok',
        storagePath: './test-storage/storage.enc',
      });

      // Set up environments with origin for CORS
      clientEnvironment = new BrowserEnvironment();
      serverEnvironment = new NodeEnvironment(storage, TEST_FINGERPRINT);

      // Initialize SDKs without API key (for public endpoints)
      serverSDK = new ArgosServerSDK({
        baseUrl: API_URL,
        environment: serverEnvironment,
        fingerprint: TEST_FINGERPRINT,
        debug: true,
      });

      clientSDK = new ArgosClientSDK({
        baseUrl: API_URL,
        environment: clientEnvironment,
        debug: true,
      });

      // First register a fingerprint (public endpoint)
      const fingerprintResponse = await serverSDK.identify({
        fingerprint: TEST_FINGERPRINT,
        metadata: {
          test: true,
          timestamp: Date.now(),
          origin: 'integration-test',
        },
      });

      if (!fingerprintResponse.success || !fingerprintResponse.data) {
        throw new Error(
          `Failed to register fingerprint: ${JSON.stringify(
            fingerprintResponse
          )}`
        );
      }

      fingerprintId = fingerprintResponse.data.id;

      // Register a new API key using the fingerprint (public endpoint)
      const apiKeyResponse = await serverSDK.createAPIKey({
        name: `test-key-${Date.now()}`,
        fingerprintId,
        metadata: {
          test: true,
          timestamp: Date.now(),
          origin: 'integration-test',
        },
      });

      if (!apiKeyResponse.success || !apiKeyResponse.data) {
        throw new Error(
          `Failed to register API key: ${JSON.stringify(apiKeyResponse)}`
        );
      }

      apiKey = apiKeyResponse.data.key;

      // Now set the API key for both SDKs for subsequent authenticated requests
      serverSDK.setApiKey(apiKey);
      clientSDK.setApiKey(apiKey);

      // Validate the new API key works
      const validation = await serverSDK.validateAPIKey(apiKey);
      if (!validation.success) {
        throw new Error(
          `API key validation failed: ${JSON.stringify(validation)}`
        );
      }
    } catch (error) {
      console.error('Setup failed:', error);
      throw error;
    }
  });

  beforeEach(async () => {
    // Ensure API key is still valid before each test
    const validation = await serverSDK.validateAPIKey(apiKey);
    if (!validation.success) {
      throw new Error('API key became invalid between tests');
    }
  });

  afterAll(async () => {
    try {
      // Clean up impressions (requires API key)
      if (fingerprintId && apiKey) {
        await serverSDK.deleteImpressions(fingerprintId);
      }

      // Revoke the API key last
      if (apiKey) {
        await serverSDK.revokeAPIKey({ key: apiKey });
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  });

  describe('Environment Detection', () => {
    it('should detect browser environment correctly', () => {
      expect(clientEnvironment.isOnline()).toBeDefined();
      expect(clientEnvironment.getUserAgent()).toBeDefined();
    });

    it('should detect node environment correctly', () => {
      expect(serverEnvironment.isOnline()).toBe(true);
      expect(serverEnvironment.getUserAgent()).toMatch(/^Node\.js\//);
    });
  });

  describe('API Key Management', () => {
    it('should handle API key in both environments', () => {
      expect(serverSDK.getApiKey()).toBe(apiKey);
      expect(clientSDK.getApiKey()).toBe(apiKey);
    });

    it('should validate the API key', async () => {
      const validation = await serverSDK.validateAPIKey(apiKey);
      expect(validation.success).toBe(true);
    });
  });

  describe('Impression Management', () => {
    it('should create and verify impressions', async () => {
      const impression = await serverSDK.createImpression({
        fingerprintId,
        type: 'test',
        data: {
          source: 'integration-test',
          timestamp: Date.now(),
        },
      });

      expect(impression.success).toBe(true);
      expect(impression.data).toBeDefined();
      expect(impression.data.type).toBe('test');
      expect(impression.data.data.source).toBe('integration-test');
    });
  });
});
