/**
 * @jest-environment jsdom
 */

import { ArgosClientSDK } from '../../client/sdk/ArgosClientSDK';
import { ArgosServerSDK } from '../../server/sdk/ArgosServerSDK';
import { BrowserEnvironment } from '../../client/environment/BrowserEnvironment';
import { NodeEnvironment } from '../../server/environment/NodeEnvironment';
import { SecureStorage } from '../../server/storage/SecureStorage';
import { CookieStorage } from '../../client/storage/CookieStorage';
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
  fillText(): void {}
  fillRect(): void {}
  getImageData() {
    return { data: new Uint8Array(400) };
  }
}

HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement) {
  return new CanvasRenderingContext2D(this);
} as any;

// Set up window.location for CORS
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:5173',
    protocol: 'http:',
    host: 'localhost:5173',
    hostname: 'localhost',
    port: '5173',
  },
  writable: true,
});

const API_URL = 'http://127.0.0.1:5001/argos-434718/us-central1/api';

describe('SDK Integration Tests', () => {
  let clientSDK: ArgosClientSDK;
  let serverSDK: ArgosServerSDK;
  let clientStorage: CookieStorage;
  let serverStorage: SecureStorage;
  let clientEnvironment: BrowserEnvironment;
  let serverEnvironment: NodeEnvironment;
  let fingerprintId: string;
  let apiKey: string;

  const TEST_FINGERPRINT = `test-fingerprint-${Date.now()}`;
  const TEST_METADATA = { test: true, timestamp: Date.now() };

  beforeAll(async () => {
    // Initialize storage
    clientStorage = new CookieStorage({
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
    serverStorage = new SecureStorage({
      encryptionKey: 'test-key-32-chars-secure-storage-ok',
      storagePath: './test-storage/server.enc',
    });

    // Initialize environments with real implementations
    clientEnvironment = new BrowserEnvironment();
    serverEnvironment = new NodeEnvironment(serverStorage, TEST_FINGERPRINT);

    // Initialize SDKs without API key first
    clientSDK = new ArgosClientSDK({
      baseUrl: API_URL,
      environment: clientEnvironment,
      debug: true,
    });

    serverSDK = new ArgosServerSDK({
      baseUrl: API_URL,
      environment: serverEnvironment,
      debug: true,
    });

    try {
      // Step 1: Create initial fingerprint
      const fingerprintResponse = await fetch(
        `${API_URL}/fingerprint/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Origin: 'http://localhost:5173',
          },
          body: JSON.stringify({
            fingerprint: TEST_FINGERPRINT,
            metadata: TEST_METADATA,
          }),
        }
      );

      const fingerprintData = await fingerprintResponse.json();
      if (!fingerprintData.success || !fingerprintData.data) {
        throw new Error(
          `Failed to create fingerprint: ${JSON.stringify(fingerprintData)}`
        );
      }

      fingerprintId = fingerprintData.data.id;

      // Step 2: Register initial API key
      const apiKeyResponse = await fetch(`${API_URL}/api-key/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: 'http://localhost:5173',
        },
        body: JSON.stringify({
          fingerprintId,
          name: 'test-key',
          metadata: {
            test: true,
            timestamp: Date.now(),
          },
        }),
      });

      const apiKeyData = await apiKeyResponse.json();
      if (!apiKeyData.success || !apiKeyData.data) {
        throw new Error(
          `Failed to register API key: ${JSON.stringify(apiKeyData)}`
        );
      }

      apiKey = apiKeyData.data.key;

      // Step 3: Update environments with the new API key
      clientEnvironment.setApiKey(apiKey);
      serverEnvironment.setApiKey(apiKey);

      // Step 4: Update SDK instances with the new API key
      clientSDK = new ArgosClientSDK({
        apiKey,
        baseUrl: API_URL,
        environment: clientEnvironment,
        debug: true,
      });

      serverSDK = new ArgosServerSDK({
        apiKey,
        baseUrl: API_URL,
        environment: serverEnvironment,
        debug: true,
      });
    } catch (error) {
      console.error('Setup failed:', error);
      throw error;
    }
  });

  afterEach(async () => {
    await clientStorage.clear();
    await serverStorage.clear();
  });

  afterAll(async () => {
    try {
      if (apiKey) {
        await fetch(`${API_URL}/api-key/revoke`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            Origin: 'http://localhost:5173',
          },
          body: JSON.stringify({ key: apiKey }),
        });
      }
      if (fingerprintId) {
        await fetch(`${API_URL}/impressions/${fingerprintId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            Origin: 'http://localhost:5173',
          },
        });
      }
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  });

  it('should create and verify impressions across environments', async () => {
    console.log('Creating impression with fingerprint:', fingerprintId);
    console.log('Using API key:', apiKey);

    try {
      // Create impression from client
      const clientImpression = await clientSDK.createImpression({
        fingerprintId,
        type: 'test',
        data: { source: 'client' },
      });

      expect(clientImpression.success).toBe(true);
      expect(clientImpression.data).toBeDefined();
    } catch (err) {
      const error = err as Error;
      // If API key needs refresh, get a new one
      if (error.message.includes('API key needs to be refreshed')) {
        const refreshResponse = await fetch(`${API_URL}/api-key/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Origin: 'http://localhost:5173',
          },
          body: JSON.stringify({
            fingerprintId,
            name: 'test-key-refresh',
            metadata: {
              test: true,
              timestamp: Date.now(),
            },
          }),
        });

        const refreshData = await refreshResponse.json();
        if (!refreshData.success || !refreshData.data) {
          throw new Error(
            `Failed to refresh API key: ${JSON.stringify(refreshData)}`
          );
        }

        apiKey = refreshData.data.key;
        clientEnvironment.setApiKey(apiKey);
        serverEnvironment.setApiKey(apiKey);

        // Retry with new API key
        const clientImpression = await clientSDK.createImpression({
          fingerprintId,
          type: 'test',
          data: { source: 'client' },
        });

        expect(clientImpression.success).toBe(true);
        expect(clientImpression.data).toBeDefined();
      } else {
        throw error;
      }
    }

    // Add a small delay to ensure the impression is registered
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create a new impression to verify it's tracked
    const secondImpression = await serverSDK.createImpression({
      fingerprintId,
      type: 'test',
      data: { source: 'server' },
    });

    expect(secondImpression.success).toBe(true);
    expect(secondImpression.data).toBeDefined();
  });

  it('should handle API key validation', async () => {
    // Test with invalid API key
    const invalidKey = 'invalid-key';
    clientEnvironment.setApiKey(invalidKey);

    // Try to use the invalid key - it should fail because the server enforces API key validation
    await expect(
      clientSDK.createImpression({
        fingerprintId,
        type: 'test',
        data: { source: 'client' },
      })
    ).rejects.toThrow();

    // Reset valid API key
    clientEnvironment.setApiKey(apiKey);

    // Verify the valid key works
    const validResponse = await clientSDK.createImpression({
      fingerprintId,
      type: 'test',
      data: { source: 'client' },
    });
    expect(validResponse.success).toBe(true);
  });

  it('should handle platform identification', async () => {
    const clientPlatform = await clientEnvironment.getPlatformInfo();
    expect(clientPlatform.runtime).toBe('browser');

    const serverPlatform = await serverEnvironment.getPlatformInfo();
    expect(serverPlatform.runtime).toBe('node');
  });
});
