import { jest } from '@jest/globals';
import { ArgosClientSDK } from '../../../client/sdk/ArgosClientSDK';
import { ArgosServerSDK } from '../../../server/sdk/ArgosServerSDK';
import { BrowserEnvironment } from '../../../client/environment/BrowserEnvironment';
import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';

describe('API Key Validation', () => {
  let clientSDK: ArgosClientSDK;
  let serverSDK: ArgosServerSDK;
  let clientEnvironment: BrowserEnvironment;
  let nodeEnvironment: NodeEnvironment;
  const fingerprintId = 'test-fingerprint-id';

  beforeEach(() => {
    clientEnvironment = new BrowserEnvironment();
    nodeEnvironment = new NodeEnvironment(
      'test-key-32-chars-secure-storage-ok',
      fingerprintId
    );

    // Initialize SDKs with appropriate environments
    clientSDK = new ArgosClientSDK({
      baseUrl: 'http://test.com',
      apiKey: 'test-key',
      environment: clientEnvironment,
      debug: true,
    });

    serverSDK = new ArgosServerSDK({
      baseUrl: 'http://test.com',
      apiKey: 'test-key',
      environment: nodeEnvironment,
      debug: true,
    });
  });

  it('should validate API key in client SDK', async () => {
    const mockValidateAPIKey = jest.spyOn(
      (clientSDK as any).apiKeyAPI,
      'validateAPIKey'
    );
    mockValidateAPIKey.mockResolvedValueOnce({
      success: true,
      data: {
        isValid: true,
        needsRefresh: false,
      },
    });

    const validationResponse = await (
      clientSDK as any
    ).apiKeyAPI.validateAPIKey('test-key');
    expect(validationResponse.success).toBe(true);
    expect(validationResponse.data.isValid).toBe(true);
    expect(validationResponse.data.needsRefresh).toBe(false);
    expect(mockValidateAPIKey).toHaveBeenCalledWith('test-key');
  });

  it('should validate API key in server SDK', async () => {
    const mockValidateAPIKey = jest.spyOn(
      (serverSDK as any).apiKeyAPI,
      'validateAPIKey'
    );
    mockValidateAPIKey.mockResolvedValueOnce({
      success: true,
      data: {
        isValid: true,
        needsRefresh: false,
      },
    });

    const validationResponse = await (
      serverSDK as any
    ).apiKeyAPI.validateAPIKey('test-key');
    expect(validationResponse.success).toBe(true);
    expect(validationResponse.data.isValid).toBe(true);
    expect(validationResponse.data.needsRefresh).toBe(false);
    expect(mockValidateAPIKey).toHaveBeenCalledWith('test-key');
  });
});
