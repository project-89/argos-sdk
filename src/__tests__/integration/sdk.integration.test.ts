import { ArgosSDK } from '../../ArgosSDK';
import { ArgosServerSDK } from '../../server/sdk/ArgosServerSDK';
import { MockEnvironment, MockStorage } from '../utils/testUtils';
import { CreateImpressionRequest } from '../../types/api';

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

    // Initialize server SDK with the API key
    serverSDK = new ArgosServerSDK({
      baseUrl,
      apiKey: fingerprintId,
      debug: true,
    });
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
