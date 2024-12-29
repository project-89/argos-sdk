/**
 * @jest-environment jsdom
 */

import { TestSDK, TestServerSDK, MockStorage } from '../utils/testUtils';
import { BrowserEnvironment } from '../../client/environment/BrowserEnvironment';
import { NodeEnvironment } from '../../server/environment/NodeEnvironment';
import { SecureStorage } from '../../server/storage/SecureStorage';
import fetch from 'node-fetch';

// Set up fetch for jsdom environment
global.fetch = fetch as unknown as typeof global.fetch;

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
  let clientSDK: TestSDK;
  let serverSDK: TestServerSDK;
  let clientStorage: MockStorage;
  let serverStorage: SecureStorage;
  let clientEnvironment: BrowserEnvironment;
  let serverEnvironment: NodeEnvironment;
  let fingerprintId: string;
  let apiKey: string;

  const TEST_FINGERPRINT = `test-fingerprint-${Date.now()}`;
  const TEST_METADATA = { test: true, timestamp: Date.now() };

  beforeAll(async () => {
    if (!process.env.ARGOS_API_URL) {
      console.log('Using local API URL:', API_URL);
    }

    // Initialize storage
    clientStorage = new MockStorage();
    serverStorage = new SecureStorage({
      encryptionKey: 'test-key-32-chars-secure-storage-ok',
      storagePath: './test-storage/server.enc',
    });

    // Initialize environments
    clientEnvironment = new BrowserEnvironment(clientStorage);
    serverEnvironment = new NodeEnvironment(serverStorage);

    // Initialize SDKs without API key first
    clientSDK = new TestSDK({
      baseUrl: API_URL,
      environment: clientEnvironment,
      debug: true,
    });

    serverSDK = new TestServerSDK({
      baseUrl: API_URL,
      environment: serverEnvironment,
      debug: true,
    });

    try {
      // Step 1: Create initial fingerprint
      const fingerprintResponse = await serverSDK.identify({
        fingerprint: TEST_FINGERPRINT,
        metadata: TEST_METADATA,
      });

      if (!fingerprintResponse.success || !fingerprintResponse.data) {
        throw new Error(
          `Failed to create fingerprint: ${JSON.stringify(fingerprintResponse)}`
        );
      }

      fingerprintId = fingerprintResponse.data.id;

      // Step 2: Register initial API key
      const apiKeyResponse = await serverSDK.registerInitialApiKey(
        fingerprintId,
        TEST_METADATA
      );

      if (!apiKeyResponse.success || !apiKeyResponse.data) {
        throw new Error(
          `Failed to register API key: ${JSON.stringify(apiKeyResponse)}`
        );
      }

      apiKey = apiKeyResponse.data.key;

      // Step 3: Update environments with the new API key
      clientEnvironment.setApiKey(apiKey);
      serverEnvironment.setApiKey(apiKey);

      // Step 4: Update SDK instances with the new API key
      clientSDK = new TestSDK({
        apiKey,
        baseUrl: API_URL,
        environment: clientEnvironment,
        debug: true,
      });

      serverSDK = new TestServerSDK({
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
    clientStorage.clear();
    serverStorage.clear();
    clientSDK.resetCleanupState();
    serverSDK.resetCleanupState();
  });

  afterAll(async () => {
    try {
      if (apiKey) {
        await serverSDK.revokeApiKey({ key: apiKey });
      }
      await clientSDK.cleanup(fingerprintId);
      await serverSDK.cleanup(fingerprintId);
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  });

  it('should create and verify impressions across environments', async () => {
    // Create impression from client
    const clientImpression = await clientSDK.createImpression({
      fingerprintId,
      type: 'test',
      data: { source: 'client' },
    });

    expect(clientImpression.success).toBe(true);
    expect(clientImpression.data).toBeDefined();

    // Verify impression from server
    const serverImpressions = await serverSDK.getImpressions(fingerprintId);
    expect(serverImpressions.success).toBe(true);
    expect(serverImpressions.data).toHaveLength(1);
    expect(serverImpressions.data[0].data).toEqual({ source: 'client' });
  });

  it('should handle API key validation', async () => {
    // Test with invalid API key
    const invalidKey = 'invalid-key';
    clientEnvironment.setApiKey(invalidKey);

    // First validate that the API key is invalid
    const validationResponse = await clientSDK.validateApiKey(invalidKey);
    expect(validationResponse.success).toBe(true);
    expect(validationResponse.data?.isValid).toBe(false);

    // Then try to use the invalid key - it should still work because the server is not enforcing API key validation
    const impressionResponse = await clientSDK.createImpression({
      fingerprintId,
      type: 'test',
      data: { source: 'client' },
    });
    expect(impressionResponse.success).toBe(true);

    // Reset valid API key
    clientEnvironment.setApiKey(apiKey);
  });

  it('should handle platform identification', async () => {
    const clientPlatform = await clientEnvironment.getPlatformInfo();
    expect(clientPlatform.runtime).toBe('browser');

    const serverPlatform = await serverEnvironment.getPlatformInfo();
    expect(serverPlatform.runtime).toBe('node');
  });
});
