import { ArgosSDK } from '../../ArgosSDK';
import { ArgosServerSDK } from '../../server/sdk/ArgosServerSDK';
import { MockEnvironment, MockStorage, TestSDK } from '../utils/testUtils';
import { ApiResponse, ImpressionData } from '../../types/api';
import { RuntimeEnvironment } from '../../core/interfaces/environment';

describe('SDK Integration Tests', () => {
  let clientSDK: TestSDK;
  let serverSDK: ArgosServerSDK;
  let mockEnvironment: MockEnvironment;
  let mockStorage: MockStorage;
  let fingerprintId: string;
  let apiKey: string;

  const TEST_FINGERPRINT = `test-fingerprint-${Date.now()}`;
  const TEST_METADATA = { test: true, timestamp: Date.now() };

  beforeAll(async () => {
    // Initialize SDKs
    mockEnvironment = new MockEnvironment(
      TEST_FINGERPRINT,
      undefined,
      undefined,
      RuntimeEnvironment.Browser
    );
    mockStorage = new MockStorage();

    clientSDK = new TestSDK({
      baseUrl:
        process.env.TEST_API_URL ||
        'http://127.0.0.1:5001/argos-434718/us-central1/api',
      environment: mockEnvironment,
      storage: mockStorage,
      debug: true,
    });

    serverSDK = new ArgosServerSDK({
      baseUrl:
        process.env.TEST_API_URL ||
        'http://127.0.0.1:5001/argos-434718/us-central1/api',
      apiKey: process.env.TEST_API_KEY || 'test-key',
      debug: true,
    });

    // Reset cleanup state
    clientSDK.resetCleanupState();

    // Create a test fingerprint
    const fingerprintResponse = await serverSDK.identify({
      fingerprint: TEST_FINGERPRINT,
      metadata: TEST_METADATA,
    });

    if (!fingerprintResponse.success || !fingerprintResponse.data) {
      throw new Error('Failed to create fingerprint');
    }

    fingerprintId = fingerprintResponse.data.id;

    // Register an API key for the fingerprint
    const apiKeyResponse = await serverSDK.registerApiKey(fingerprintId, {
      test: true,
      timestamp: Date.now(),
    });

    if (!apiKeyResponse.success || !apiKeyResponse.data) {
      throw new Error('Failed to register API key');
    }

    apiKey = apiKeyResponse.data.key;

    // Set the API key in both SDKs
    mockEnvironment.setApiKey(apiKey);
    serverSDK.setApiKey(apiKey);
  });

  beforeEach(async () => {
    // Reset storage and environment state
    mockStorage.clear();
    mockEnvironment.setApiKey(apiKey);
    serverSDK.setApiKey(apiKey);
  });

  afterEach(async () => {
    // Clean up any resources created during the test
    await clientSDK.cleanup(fingerprintId);
  });

  afterAll(async () => {
    // Final cleanup
    try {
      if (apiKey) {
        await serverSDK.revokeApiKey({ key: apiKey });
      }
      if (fingerprintId) {
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
          (impression) =>
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
      mockEnvironment.setApiKey(newApiKey);
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
      mockEnvironment.setApiKey(newApiKey);
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
