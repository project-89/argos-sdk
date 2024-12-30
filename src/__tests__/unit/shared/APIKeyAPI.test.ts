import { jest } from '@jest/globals';
import { APIKeyAPI } from '../../../shared/api/APIKeyAPI';
import { HttpMethod } from '../../../shared/interfaces/http';
import { TestEnvironment } from './mocks/TestEnvironment';
import type { APIKeyData } from '../../../shared/interfaces/api';

const BASE_URL = 'https://test.example.com';
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof global.fetch;

describe('APIKeyAPI', () => {
  let api: APIKeyAPI<Response>;
  let environment: TestEnvironment;

  const mockAPIKeyData: APIKeyData = {
    key: 'test-api-key',
    fingerprintId: 'test-fingerprint-id',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    environment = new TestEnvironment();
    api = new APIKeyAPI({
      baseUrl: BASE_URL,
      environment,
    });

    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockAPIKeyData }),
      } as Response)
    );
  });

  it('should register initial API key', async () => {
    const fingerprintId = 'test-fingerprint-id';
    const metadata = {
      source: 'test',
      environment: 'development',
    };

    await api.registerInitialApiKey(fingerprintId, metadata);

    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/api-key/register`, {
      method: HttpMethod.POST,
      body: JSON.stringify({
        fingerprintId,
        metadata,
      }),
      headers: {
        'content-type': 'application/json',
        'user-agent': 'test-fingerprint',
      },
      skipAuth: true,
    });
  });

  it('should create API key', async () => {
    const request = {
      fingerprintId: 'test-fingerprint-id',
      name: 'test-key',
      metadata: { test: true },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    await api.createAPIKey(request);

    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/api-key/register`, {
      method: HttpMethod.POST,
      body: JSON.stringify(request),
      headers: {
        'content-type': 'application/json',
        'user-agent': 'test-fingerprint',
      },
      skipAuth: true,
    });
  });

  it('should validate API key', async () => {
    const key = 'test-api-key';

    await api.validateAPIKey(key);

    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/api-key/validate`, {
      method: HttpMethod.POST,
      body: JSON.stringify({ key }),
      headers: {
        'content-type': 'application/json',
        'user-agent': 'test-fingerprint',
      },
    });
  });

  it('should revoke API key', async () => {
    const request = { key: 'test-api-key' };

    await api.revokeAPIKey(request);

    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/api-key/revoke`, {
      method: HttpMethod.POST,
      body: JSON.stringify(request),
      headers: {
        'content-type': 'application/json',
        'user-agent': 'test-fingerprint',
      },
    });
  });

  it('should handle API errors', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ success: false, error: 'Test error' }),
      } as Response)
    );

    await expect(api.validateAPIKey('invalid-key')).rejects.toThrow();
  });
});
