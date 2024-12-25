import { ArgosSDK } from '../../ArgosSDK';
import { ArgosServerSDK } from '../../server/sdk/ArgosServerSDK';
import { MockEnvironment, MockStorage } from '../utils/testUtils';
import {
  CreateImpressionRequest,
  VisitData,
  CreateVisitRequest,
} from '../../types/api';

// Only run these tests when TEST_MODE=integration
const itif = process.env.TEST_MODE === 'integration' ? it : it.skip;

describe('SDK Integration Tests', () => {
  const baseUrl =
    process.env.TEST_API_URL ||
    'http://127.0.0.1:5001/argos-434718/us-central1/api';
  let clientSDK: ArgosSDK;
  let serverSDK: ArgosServerSDK;
  let fingerprintId: string;

  beforeAll(async () => {
    // Initialize client SDK
    clientSDK = new ArgosSDK({
      baseUrl,
      environment: new MockEnvironment(),
      storage: new MockStorage(),
      debug: true,
    });

    // Register a fingerprint and get API key
    const result = await clientSDK.identify({
      fingerprint: 'test-integration-fingerprint',
      metadata: {
        source: 'integration-test',
        userAgent: 'test-agent',
        language: 'en-US',
        platform: 'test-platform',
      },
    });

    if (!result.data) {
      throw new Error('Failed to create fingerprint');
    }

    fingerprintId = result.data.id;

    // Get the API key for this fingerprint
    const apiKeyResult = await clientSDK.registerApiKey(fingerprintId, {
      source: 'integration-test',
      metadata: {
        type: 'test',
        environment: 'integration',
      },
    });

    if (!apiKeyResult.data) {
      throw new Error('Failed to get API key');
    }

    // Initialize server SDK with the API key
    serverSDK = new ArgosServerSDK({
      baseUrl,
      apiKey: apiKeyResult.data.key,
      debug: true,
    });

    // Update client SDK with the API key as well
    clientSDK.setApiKey(apiKeyResult.data.key);
  });

  describe('Client SDK', () => {
    itif('should create and retrieve impressions', async () => {
      // Create an impression
      const createRequest: CreateImpressionRequest = {
        fingerprintId,
        type: 'test-impression',
        data: { test: 'data' },
      };
      const createResult = await clientSDK.createImpression(createRequest);
      expect(createResult.success).toBe(true);
      expect(createResult.data?.type).toBe('test-impression');

      // Get impressions
      const getResult = await clientSDK.getImpressions(fingerprintId);
      expect(getResult.success).toBe(true);
      expect(getResult.data?.length).toBeGreaterThan(0);
    });

    itif('should track visits', async () => {
      const result = await clientSDK.track('visit', {
        fingerprintId,
        url: 'https://test.com',
        title: 'Test Page',
        metadata: {
          referrer: '',
          userAgent: 'test-agent',
          language: 'en-US',
          platform: 'test-platform',
          hostname: 'test.com',
          path: '/',
        },
      });
      expect(result.success).toBe(true);
      expect(result.data?.url).toBe('https://test.com');
    });
  });

  describe('Server SDK', () => {
    itif(
      'should create and retrieve impressions for a fingerprint',
      async () => {
        // Create an impression
        const createResult = await serverSDK.createImpression({
          fingerprintId,
          type: 'server-test-impression',
          data: { test: 'server-data' },
        });
        expect(createResult.success).toBe(true);
        expect(createResult.data?.type).toBe('server-test-impression');

        // Get impressions
        const getResult = await serverSDK.getImpressions(fingerprintId);
        expect(getResult.success).toBe(true);
        expect(getResult.data?.length).toBeGreaterThan(0);
      }
    );

    itif('should create visits for a fingerprint', async () => {
      const result = await serverSDK.track('visit', {
        fingerprintId,
        url: 'https://test.com/server',
        title: 'Server Test Page',
        metadata: {
          source: 'server-test',
          userAgent: 'test-agent',
          language: 'en-US',
          platform: 'test-platform',
        },
      });
      expect(result.success).toBe(true);
      expect(result.data?.url).toBe('https://test.com/server');
    });

    itif('should handle API key refresh', async () => {
      // First, create a fingerprint and get initial API key
      const fingerprint = await clientSDK.identify({
        fingerprint: 'test-refresh-fingerprint',
        metadata: {
          source: 'integration-test',
          test: 'refresh',
        },
      });
      expect(fingerprint.success).toBe(true);
      const initialFingerprintId = fingerprint.data?.id;
      expect(initialFingerprintId).toBeDefined();

      // Create server SDK with the fingerprint ID
      const testServerSDK = new ArgosServerSDK({
        baseUrl,
        apiKey: initialFingerprintId!,
        debug: true,
      });

      // Register a new API key for the same fingerprint
      // This should invalidate the previous key
      const newKeyResponse = await clientSDK.registerApiKey(
        initialFingerprintId!,
        {
          source: 'test-refresh',
        }
      );
      expect(newKeyResponse.success).toBe(true);
      expect(newKeyResponse.data?.key).toBeDefined();

      // Try to use the server SDK with the old key
      // It should automatically refresh and continue working
      const trackResult = await testServerSDK.track('visit', {
        fingerprintId: initialFingerprintId!,
        url: 'https://test.com/refresh',
        title: 'Refresh Test',
      });

      expect(trackResult.success).toBe(true);
      expect(trackResult.data?.url).toBe('https://test.com/refresh');
    });

    itif('should handle multiple API key refreshes', async () => {
      // Create initial fingerprint
      const fingerprint = await clientSDK.identify({
        fingerprint: 'test-multiple-refresh',
        metadata: {
          source: 'integration-test',
          test: 'multiple-refresh',
        },
      });
      expect(fingerprint.success).toBe(true);
      const fpId = fingerprint.data?.id;
      expect(fpId).toBeDefined();

      // Create server SDK
      const testServerSDK = new ArgosServerSDK({
        baseUrl,
        apiKey: fpId!,
        debug: true,
      });

      // First successful request
      let trackResult = await testServerSDK.track('visit', {
        fingerprintId: fpId!,
        url: 'https://test.com/refresh/1',
        title: 'Refresh Test 1',
      });
      expect(trackResult.success).toBe(true);

      // Invalidate key by registering new one
      await clientSDK.registerApiKey(fpId!, { iteration: 1 });

      // Second request should work with auto-refresh
      trackResult = await testServerSDK.track('visit', {
        fingerprintId: fpId!,
        url: 'https://test.com/refresh/2',
        title: 'Refresh Test 2',
      });
      expect(trackResult.success).toBe(true);

      // Invalidate again
      await clientSDK.registerApiKey(fpId!, { iteration: 2 });

      // Third request should still work
      trackResult = await testServerSDK.track('visit', {
        fingerprintId: fpId!,
        url: 'https://test.com/refresh/3',
        title: 'Refresh Test 3',
      });
      expect(trackResult.success).toBe(true);
    });
  });

  describe('Cross-environment Verification', () => {
    itif('should see client impressions from server SDK', async () => {
      // Create impression with client SDK
      const createRequest: CreateImpressionRequest = {
        fingerprintId,
        type: 'cross-env-test',
        data: { source: 'client' },
      };
      await clientSDK.createImpression(createRequest);

      // Verify with server SDK
      const result = await serverSDK.getImpressions(fingerprintId, {
        type: 'cross-env-test',
      });
      expect(result.success).toBe(true);
      expect(result.data?.some((imp) => imp.type === 'cross-env-test')).toBe(
        true
      );
    });

    itif('should see server impressions from client SDK', async () => {
      // Create impression with server SDK
      await serverSDK.createImpression({
        fingerprintId,
        type: 'cross-env-test-2',
        data: { source: 'server' },
      });

      // Verify with client SDK
      const result = await clientSDK.getImpressions(fingerprintId, {
        type: 'cross-env-test-2',
      });
      expect(result.success).toBe(true);
      expect(result.data?.some((imp) => imp.type === 'cross-env-test-2')).toBe(
        true
      );
    });
  });
});
