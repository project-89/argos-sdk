import { ArgosServerSDK } from '../../server/sdk/ArgosServerSDK';
import { MockEnvironment, MockStorage, TestSDK } from '../utils/testUtils';
import type { ApiResponse, ImpressionData } from '../../shared/interfaces/api';
import { RuntimeEnvironment } from '../../shared/interfaces/environment';

const API_URL =
  process.env.ARGOS_API_URL ||
  'http://127.0.0.1:5001/argos-434718/us-central1/api';

describe('SDK Integration Tests', () => {
  let clientSDK: TestSDK;
  let serverSDK: ArgosServerSDK;
  let serverEnvironment: MockEnvironment;
  let clientEnvironment: MockEnvironment;
  let mockStorage: MockStorage;
  let fingerprintId: string;
  let apiKey: string;

  const TEST_FINGERPRINT = `test-fingerprint-${Date.now()}`;
  const TEST_METADATA = { test: true, timestamp: Date.now() };

  beforeAll(async () => {
    if (!process.env.ARGOS_API_URL) {
      console.log('Skipping integration tests - ARGOS_API_URL not set');
      return;
    }

    // Initialize environment and storage
    serverEnvironment = new MockEnvironment(
      TEST_FINGERPRINT,
      undefined,
      'node-fetch/1.0 (Test Server Environment)',
      RuntimeEnvironment.Node
    );

    clientEnvironment = new MockEnvironment(
      TEST_FINGERPRINT,
      undefined,
      'Mozilla/5.0 (Test Browser Environment)',
      RuntimeEnvironment.Browser
    );

    mockStorage = new MockStorage();

    // Initialize server SDK without an API key for public routes
    serverSDK = new ArgosServerSDK({
      baseUrl: API_URL,
      debug: true,
      environment: serverEnvironment,
    });

    try {
      console.log('Integration test starting with API URL:', API_URL);

      // Step 1: Create a fingerprint (public route)
      console.log('Attempting to create fingerprint with:', {
        url: `${API_URL}/fingerprint/register`,
        fingerprint: TEST_FINGERPRINT,
        metadata: TEST_METADATA,
      });

      const fingerprintResponse = await serverSDK.identify({
        fingerprint: TEST_FINGERPRINT,
        metadata: TEST_METADATA,
      });

      console.log('Raw fingerprint response:', fingerprintResponse);

      if (!fingerprintResponse.success || !fingerprintResponse.data) {
        console.error(
          'Fingerprint creation failed. Full response:',
          fingerprintResponse
        );
        throw new Error(
          `Failed to create fingerprint: ${JSON.stringify(fingerprintResponse)}`
        );
      }

      fingerprintId = fingerprintResponse.data.id;
      console.log('Created fingerprint:', fingerprintId);

      // Step 2: Register an API key for the fingerprint (public route)
      console.log('Registering API key...');
      const apiKeyResponse = await serverSDK.registerInitialApiKey(
        fingerprintId,
        {
          test: true,
          timestamp: Date.now(),
        }
      );

      console.log('API key response:', apiKeyResponse);

      if (!apiKeyResponse.success || !apiKeyResponse.data) {
        throw new Error(
          `Failed to register API key: ${JSON.stringify(apiKeyResponse)}`
        );
      }

      apiKey = apiKeyResponse.data.key;
      console.log('Registered API key:', apiKey);

      // Step 3: Update both SDKs with the new API key
      serverEnvironment.setApiKey(apiKey);
      clientEnvironment.setApiKey(apiKey);
      serverSDK.setApiKey(apiKey);

      // Step 4: Initialize client SDK with the registered API key
      clientSDK = new TestSDK({
        baseUrl: API_URL,
        environment: clientEnvironment,
        debug: true,
        apiKey,
      });

      // Reset cleanup state
      clientSDK.resetCleanupState();
    } catch (error) {
      console.error('Setup failed:', error);
      throw error;
    }
  });

  beforeEach(() => {
    if (!process.env.ARGOS_API_URL || !clientSDK) {
      return;
    }
    // Reset storage and environment state
    mockStorage.clear();
    serverEnvironment.setApiKey(apiKey);
    clientEnvironment.setApiKey(apiKey);
    serverSDK.setApiKey(apiKey);
  });

  afterEach(async () => {
    if (!process.env.ARGOS_API_URL || !clientSDK) {
      return;
    }
    // Clean up any resources created during the test
    await clientSDK.cleanup(fingerprintId);
  });

  afterAll(async () => {
    if (!process.env.ARGOS_API_URL || !clientSDK) {
      return;
    }
    // Final cleanup
    try {
      if (apiKey) {
        console.log('Revoking API key:', apiKey);
        await serverSDK.revokeApiKey({ key: apiKey });
      }
      if (fingerprintId) {
        console.log('Cleaning up fingerprint:', fingerprintId);
        await clientSDK.cleanup(fingerprintId);
      }
    } catch (error) {
      console.warn('Final cleanup failed:', error);
    }
  });

  describe('Cross-environment Verification', () => {
    it('should see client impressions from server SDK', async () => {
      // Create client impression
      const clientResult = await clientSDK.createImpression({
        fingerprintId,
        type: 'test-type',
        data: { source: 'client', timestamp: Date.now() },
      });
      expect(clientResult.success).toBe(true);

      // Verify from server
      const serverResult = await serverSDK.getImpressions(fingerprintId, {
        type: 'test-type',
      });
      expect(serverResult.success).toBe(true);
      expect(
        serverResult.data?.some(
          (impression) =>
            impression.fingerprintId === fingerprintId &&
            impression.type === 'test-type' &&
            impression.data.source === 'client'
        )
      ).toBe(true);
    });

    it('should see server impressions from client SDK', async () => {
      // Create server impression
      const serverResult = await serverSDK.createImpression({
        fingerprintId,
        type: 'test-type',
        data: { source: 'server', timestamp: Date.now() },
      });
      expect(serverResult.success).toBe(true);

      // Verify from client
      const clientResult = await clientSDK.getImpressions(fingerprintId, {
        type: 'test-type',
      });
      expect(clientResult.success).toBe(true);
      expect(
        clientResult.data?.some(
          (impression: ImpressionData) =>
            impression.fingerprintId === fingerprintId &&
            impression.type === 'test-type' &&
            impression.data.source === 'server'
        )
      ).toBe(true);
    });
  });

  describe('API Key Management', () => {
    it('should handle API key updates correctly', async () => {
      // Create a new API key
      const newKeyResponse = await serverSDK.registerApiKey(fingerprintId, {
        test: true,
        timestamp: Date.now(),
      });
      expect(newKeyResponse.success).toBe(true);
      expect(newKeyResponse.data?.key).toBeTruthy();

      const newApiKey = newKeyResponse.data!.key;
      serverEnvironment.setApiKey(newApiKey);
      clientEnvironment.setApiKey(newApiKey);
      serverSDK.setApiKey(newApiKey);

      // Try to use the new API key
      const result = await clientSDK.createImpression({
        fingerprintId,
        type: 'test-type',
        data: { source: 'client-new-key', timestamp: Date.now() },
      });
      expect(result.success).toBe(true);

      // Clean up the new API key
      await serverSDK.revokeApiKey({ key: newApiKey });
    });

    it('should handle API key revocation gracefully', async () => {
      // Create and immediately revoke a new API key
      const newKeyResponse = await serverSDK.registerApiKey(fingerprintId, {
        test: true,
        timestamp: Date.now(),
      });
      expect(newKeyResponse.success).toBe(true);

      const newApiKey = newKeyResponse.data!.key;
      serverEnvironment.setApiKey(newApiKey);
      clientEnvironment.setApiKey(newApiKey);
      serverSDK.setApiKey(newApiKey);

      await serverSDK.revokeApiKey({ key: newApiKey });

      // Try to use the revoked API key
      try {
        await clientSDK.createImpression({
          fingerprintId,
          type: 'test-type',
          data: { source: 'client-revoked-key', timestamp: Date.now() },
        });
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(String(error)).toContain('Invalid API key');
      }
    });
  });
});
