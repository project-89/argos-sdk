/* eslint-disable @typescript-eslint/no-non-null-assertion */
/**
 * @jest-environment jsdom
 */

import { ArgosServerSDK } from '../../server/sdk/ArgosServerSDK';
import { ArgosClientSDK } from '../../client/sdk/ArgosClientSDK';
import { NodeEnvironment } from '../../server/environment/NodeEnvironment';
import { BrowserEnvironment } from '../../client/environment/BrowserEnvironment';
import { SecureStorage } from '../../server/storage/SecureStorage';
import fetch from 'node-fetch';

// Set up fetch for jsdom environment
global.fetch = fetch as unknown as typeof global.fetch;

// Set origin to match allowed CORS origins
Object.defineProperty(window, 'location', {
  value: new URL('http://localhost:3000'),
});

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
  const API_URL = 'http://localhost:5001/argos-434718/us-central1/api';
  let serverSDK: ArgosServerSDK;
  let clientSDK: ArgosClientSDK;
  let nodeEnvironment: NodeEnvironment;
  let browserEnvironment: BrowserEnvironment;
  let storage: SecureStorage;
  let currentApiKey: string | null = null;
  let fingerprintId: string | null = null;

  beforeAll(async () => {
    storage = new SecureStorage({
      encryptionKey: 'test-key-32-chars-secure-storage-ok',
    });

    nodeEnvironment = new NodeEnvironment(storage);
    browserEnvironment = new BrowserEnvironment();

    serverSDK = new ArgosServerSDK({
      baseUrl: API_URL,
      environment: nodeEnvironment,
      encryptionKey: 'test-key-32-chars-secure-storage-ok',
    });

    clientSDK = new ArgosClientSDK({
      baseUrl: API_URL,
      environment: browserEnvironment,
    });

    // Register fingerprint first
    const fingerprintResponse = await serverSDK.identify({
      fingerprint: 'test-server-fingerprint',
      metadata: {
        test: true,
        timestamp: Date.now(),
        origin: 'integration-test',
      },
    });

    if (!fingerprintResponse.success || !fingerprintResponse.data?.id) {
      throw new Error(
        'Failed to register fingerprint: ' + JSON.stringify(fingerprintResponse)
      );
    }

    fingerprintId = fingerprintResponse.data.id;

    // Create initial API key
    const keyResponse = await serverSDK.registerApiKey(fingerprintId);

    if (!keyResponse.success || !keyResponse.data?.key) {
      throw new Error(
        'Failed to create initial API key: ' + JSON.stringify(keyResponse)
      );
    }

    currentApiKey = keyResponse.data.key;
    serverSDK.setApiKey(currentApiKey);
    clientSDK.setApiKey(currentApiKey);
  });

  afterAll(async () => {
    if (currentApiKey) {
      try {
        await serverSDK.revokeAPIKey({ key: currentApiKey });
      } catch (error) {
        console.error('Failed to revoke API key:', error);
      }
    }
  });

  describe('Environment Detection', () => {
    it('should detect browser environment correctly', () => {
      expect(clientSDK.getApiKey()).toBeDefined();
      expect(browserEnvironment.type).toBe('browser');
    });

    it('should detect node environment correctly', () => {
      expect(serverSDK.getApiKey()).toBeDefined();
      expect(nodeEnvironment.type).toBe('node');
    });
  });

  describe('API Key Management', () => {
    it('should handle API key in both environments', async () => {
      expect(serverSDK.getApiKey()).toBe(currentApiKey);
      expect(clientSDK.getApiKey()).toBe(currentApiKey);
    });

    it('should validate the API key', async () => {
      const validation = await serverSDK.validateAPIKey(currentApiKey!);
      expect(validation.success).toBe(true);
    });

    it('should handle concurrent API key operations', async () => {
      const validations = await Promise.all([
        serverSDK.validateAPIKey(currentApiKey!),
        serverSDK.validateAPIKey(currentApiKey!),
        serverSDK.validateAPIKey(currentApiKey!),
      ]);

      validations.forEach((validation) => {
        expect(validation.success).toBe(true);
      });
    });

    it('should handle API key rotation gracefully', async () => {
      const oldKey = currentApiKey;
      const response = await serverSDK.rotateAPIKey(currentApiKey!);
      expect(response.success).toBe(true);
      expect(response.data.key).toBeDefined();
      expect(response.data.key).not.toBe(oldKey);

      // Update all instances with new key
      currentApiKey = response.data.key;
      serverSDK.setApiKey(currentApiKey);
      clientSDK.setApiKey(currentApiKey);

      // Verify new key works
      const validation = await serverSDK.validateAPIKey(currentApiKey);
      expect(validation.success).toBe(true);
    });

    it('should handle API key refresh when near expiration', async () => {
      const oldKey = currentApiKey;
      const response = await serverSDK.refreshAPIKey(currentApiKey!);
      expect(response.success).toBe(true);
      expect(response.data.key).toBeDefined();
      expect(response.data.key).not.toBe(oldKey);

      // Update all instances with new key
      currentApiKey = response.data.key;
      serverSDK.setApiKey(currentApiKey);
      clientSDK.setApiKey(currentApiKey);

      // Verify new key works
      const validation = await serverSDK.validateAPIKey(currentApiKey);
      expect(validation.success).toBe(true);
    });

    it('should handle API key revocation correctly', async () => {
      const response = await serverSDK.revokeAPIKey({ key: currentApiKey! });
      expect(response.success).toBe(true);

      // Create new key for remaining tests
      const keyResponse = await serverSDK.registerApiKey(fingerprintId!);
      currentApiKey = keyResponse.data.key;
      serverSDK.setApiKey(currentApiKey);
      clientSDK.setApiKey(currentApiKey);
    });
  });

  describe('Impression Management', () => {
    it('should create and verify impressions', async () => {
      const impression = await serverSDK.track('test-impression', {
        fingerprintId: fingerprintId!,
        url: 'https://example.com',
        title: 'Test Page',
        metadata: { source: 'integration-test' },
      });

      expect(impression.success).toBe(true);
      expect(impression.data.id).toBeDefined();

      const impressions = await serverSDK.getImpressions(fingerprintId!);
      expect(impressions.success).toBe(true);
      expect(impressions.data.length).toBeGreaterThan(0);
    });
  });

  describe('Presence Tracking', () => {
    it('should update and verify presence status', async () => {
      const presence = await clientSDK.updatePresence(fingerprintId!, 'online');
      expect(presence.success).toBe(true);
    });
  });

  describe('End-to-end flow', () => {
    it('should handle complete user journey', async () => {
      const testFingerprint = 'test-client-fingerprint';

      // Client identifies itself
      const identifyResult = await clientSDK.identify({
        fingerprint: testFingerprint,
        metadata: { source: 'integration-test' },
      });
      expect(identifyResult.success).toBe(true);
      expect(identifyResult.data.id).toBeDefined();
      const clientFingerprintId = identifyResult.data.id;

      // Create API key for the client fingerprint
      const keyResponse = await serverSDK.registerApiKey(clientFingerprintId);
      expect(keyResponse.success).toBe(true);
      expect(keyResponse.data.key).toBeDefined();
      const clientApiKey = keyResponse.data.key;

      // Update both SDKs with the new API key
      serverSDK.setApiKey(clientApiKey);
      clientSDK.setApiKey(clientApiKey);

      // Server tracks an impression
      const trackResult = await serverSDK.track('test-event', {
        fingerprintId: clientFingerprintId,
        url: 'https://example.com',
        title: 'Test Page',
        metadata: { test: 'data' },
      });
      expect(trackResult.success).toBe(true);

      // Server gets impressions
      const impressions = await serverSDK.getImpressions(clientFingerprintId);
      expect(impressions.success).toBe(true);
      expect(impressions.data.length).toBeGreaterThan(0);
      expect(impressions.data[0].type).toBe('test-event');

      // Clean up by revoking the client API key
      const revokeResponse = await serverSDK.revokeAPIKey({
        key: clientApiKey,
      });
      expect(revokeResponse.success).toBe(true);
    });
  });
});
