import { jest } from '@jest/globals';
import { ArgosClientSDK } from '../../../client/sdk/ArgosClientSDK';
import { ArgosServerSDK } from '../../../server/sdk/ArgosServerSDK';
import { BrowserEnvironment } from '../../../client/environment/BrowserEnvironment';
import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';

describe('Impression Management', () => {
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

  it('should create impressions in client SDK', async () => {
    const mockCreateImpression = jest.spyOn(
      (clientSDK as any).impressionAPI,
      'createImpression'
    );
    mockCreateImpression.mockResolvedValueOnce({
      success: true,
      data: {
        id: 'test-impression-id',
        fingerprintId,
        type: 'test',
        data: { source: 'client' },
        createdAt: { _seconds: 0, _nanoseconds: 0 },
      },
    });

    const impressionResponse = await (
      clientSDK as any
    ).impressionAPI.createImpression({
      fingerprintId,
      type: 'test',
      data: { source: 'client' },
    });
    expect(impressionResponse.success).toBe(true);
    expect(impressionResponse.data.fingerprintId).toBe(fingerprintId);
    expect(impressionResponse.data.data).toEqual({ source: 'client' });
    expect(mockCreateImpression).toHaveBeenCalledWith({
      fingerprintId,
      type: 'test',
      data: { source: 'client' },
    });
  });

  it('should get impressions in client SDK', async () => {
    const mockGetImpressions = jest.spyOn(
      (clientSDK as any).impressionAPI,
      'getImpressions'
    );
    mockGetImpressions.mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 'test-impression-id',
          fingerprintId,
          type: 'test',
          data: { source: 'client' },
          createdAt: { _seconds: 0, _nanoseconds: 0 },
        },
      ],
    });

    const impressionsResponse = await (
      clientSDK as any
    ).impressionAPI.getImpressions(fingerprintId);
    expect(impressionsResponse.success).toBe(true);
    expect(impressionsResponse.data).toHaveLength(1);
    expect(impressionsResponse.data[0].data).toEqual({ source: 'client' });
    expect(mockGetImpressions).toHaveBeenCalledWith(fingerprintId);
  });

  it('should get impressions in server SDK', async () => {
    const mockGetImpressions = jest.spyOn(
      (serverSDK as any).impressionAPI,
      'getImpressions'
    );
    mockGetImpressions.mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 'test-impression-id',
          fingerprintId,
          type: 'test',
          data: { source: 'client' },
          createdAt: { _seconds: 0, _nanoseconds: 0 },
        },
      ],
    });

    const impressionsResponse = await (
      serverSDK as any
    ).impressionAPI.getImpressions(fingerprintId);
    expect(impressionsResponse.success).toBe(true);
    expect(impressionsResponse.data).toHaveLength(1);
    expect(impressionsResponse.data[0].data).toEqual({ source: 'client' });
    expect(mockGetImpressions).toHaveBeenCalledWith(fingerprintId);
  });
});
