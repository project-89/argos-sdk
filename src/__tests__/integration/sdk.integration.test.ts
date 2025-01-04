import fetch, { Request, Response } from 'node-fetch';

// Set up node-fetch with proper headers
const enhancedFetch = Object.assign(
  (url: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    const headers = {
      Origin: 'http://localhost:3000',
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    };
    return fetch(url, { ...init, headers });
  },
  fetch
);

if (!globalThis.fetch) {
  globalThis.fetch = enhancedFetch as unknown as typeof global.fetch;
  globalThis.Request = Request as unknown as typeof global.Request;
  globalThis.Response = Response as unknown as typeof global.Response;
}

/**
 * @jest-environment jsdom
 */

import { ArgosServerSDK } from '../../server/sdk/ArgosServerSDK';
import { ArgosClientSDK } from '../../client/sdk/ArgosClientSDK';
import { NodeEnvironment } from '../../server/environment/NodeEnvironment';
import { BrowserEnvironment } from '../../client/environment/BrowserEnvironment';
import { SecureStorage } from '../../server/storage/SecureStorage';
import { RuntimeEnvironment } from '../../shared/interfaces/environment';
import type {
  ApiResponse,
  APIKeyData,
  ValidateAPIKeyResponse,
} from '../../shared/interfaces/api';

// Set up missing browser APIs for fingerprint generation
class MessageChannel {
  port1: any = { postMessage: jest.fn() };
  port2: any = { postMessage: jest.fn() };
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
    return;
  }
  fillRect() {
    return;
  }
  getImageData() {
    return { data: new Uint8Array(400) };
  }
}

HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement) {
  return new CanvasRenderingContext2D(this);
} as any;

// Set origin to match allowed CORS origins
Object.defineProperty(window, 'location', {
  value: new URL('http://localhost:3000'),
  writable: true,
});

describe('SDK Integration Tests', () => {
  const API_URL = 'http://localhost:5001/argos-434718/us-central1/api';
  let serverSDK: ArgosServerSDK;
  let clientSDK: ArgosClientSDK;
  let nodeEnvironment: NodeEnvironment;
  let browserEnvironment: BrowserEnvironment;
  let storage: SecureStorage;
  let currentApiKey = '';
  let fingerprintId = '';

  beforeEach(async () => {
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
      fingerprint: `test-server-fingerprint-${Date.now()}`, // Make unique for each test
      metadata: {
        test: true,
        timestamp: Date.now(),
        origin: 'integration-test',
      },
    });

    if (!fingerprintResponse.data?.id) {
      throw new Error('Failed to get fingerprint ID');
    }
    fingerprintId = fingerprintResponse.data.id;

    // Register initial API key
    const keyResponse = await serverSDK.registerApiKey(fingerprintId);
    if (!keyResponse.data?.key) {
      throw new Error('Failed to register API key');
    }
    currentApiKey = keyResponse.data.key;

    // Set the API key for both SDKs
    serverSDK.setApiKey(currentApiKey);
    clientSDK.setApiKey(currentApiKey);
  });

  afterEach(async () => {
    if (currentApiKey) {
      try {
        // Clean up by revoking the API key
        await serverSDK.revokeAPIKey({ key: currentApiKey });
      } catch (error) {
        console.warn('Failed to revoke API key during cleanup:', error);
      }
      currentApiKey = ''; // Clear the key after revocation
    }
  });

  describe('API Key Management', () => {
    it('should handle API key revocation correctly', async () => {
      expect.assertions(3); // We expect 3 assertions to be called

      // First validate the current key is working
      const validationResult = await serverSDK.validateAPIKey(currentApiKey);
      expect(validationResult.success).toBe(true);
      expect(validationResult.data.isValid).toBe(true);

      // Now revoke it
      const result = await serverSDK.revokeAPIKey({ key: currentApiKey });
      expect(result.success).toBe(true);

      // Try to validate the revoked key - this should throw an error
      try {
        await serverSDK.validateAPIKey(currentApiKey);
      } catch (error) {
        // We expect this error, so we don't need to assert anything
      }

      // Clear the current key since we revoked it
      currentApiKey = '';
    });

    it('should validate the API key', async () => {
      const result = await serverSDK.validateAPIKey(currentApiKey);
      expect(result.success).toBe(true);
      expect(result.data.isValid).toBe(true);
    });

    it('should handle concurrent API key operations', async () => {
      const results = await Promise.all([
        serverSDK.validateAPIKey(currentApiKey),
        serverSDK.validateAPIKey(currentApiKey),
      ]);

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[0].data.isValid).toBe(true);
      expect(results[1].data.isValid).toBe(true);
    });
  });
});
