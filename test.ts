import { ArgosSDK } from '@project89/argos-sdk';

// Test SDK initialization with type checking
const sdk = new ArgosSDK({
  apiKey: 'test-key',
  baseUrl: 'http://localhost:3000',
});

// Test property type inference
const fingerprint = sdk.fingerprint;
const visit = sdk.visit;
const role = sdk.role;
const tag = sdk.tag;
const price = sdk.price;
const realityStability = sdk.realityStability;
const apiKeys = sdk.apiKeys;
const debug = sdk.debug;

// Test method return type inference
const isOnline: boolean = sdk.isOnline();
const queueSize: number = sdk.getQueueSize();

// Test async methods with type checking
async function testAPI() {
  // Test fingerprint API
  const fp = await fingerprint.createFingerprint({
    userAgent: 'test-agent',
    ip: '127.0.0.1',
    metadata: {
      language: 'en',
      platform: 'web',
    },
  });

  if (fp.success && fp.data) {
    const fingerprintId = fp.data.id;

    // Test role API
    await role.addRoles(fingerprintId, ['user']);
    const roles = await role.getRoles(fingerprintId);

    // Test visit API
    await visit.createVisit({
      id: 'visit-1',
      fingerprintId,
      url: 'https://example.com',
      timestamp: new Date().toISOString(),
    });

    // Test tag API
    await tag.createTag({
      fingerprintId,
      tags: ['test-tag'],
      timestamp: new Date().toISOString(),
    });

    // Test price API
    const priceData = await price.getCurrentPrice();
    if (priceData.success) {
      console.log(priceData.data.amount);
    }

    // Test reality stability API
    const stability = await realityStability.getCurrentStability();
    if (stability.success) {
      console.log(stability.data.stabilityIndex);
    }

    // Test debug API
    const debugInfo = debug.getDebugInfo();

    // Test cache and cleanup
    sdk.clearCache();
  }
}

// Test error handling with type checking
async function testErrorHandling() {
  try {
    const result = await fingerprint.getFingerprint('non-existent-id');
    if (!result.success) {
      console.error(result.error);
    }
  } catch (error) {
    console.error(error);
  }
}

// Test cleanup
function cleanup() {
  sdk.destroy();
}
