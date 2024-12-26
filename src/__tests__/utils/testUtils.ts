import type { ApiResponse } from '../../types/api';
import fetch, { Response, Headers } from 'node-fetch';
import {
  EnvironmentInterface,
  StorageInterface,
  RuntimeEnvironment,
} from '../../core/interfaces/environment';
import { ArgosSDK, ArgosSDKConfig } from '../../ArgosSDK';
import { FingerprintAPI } from '../../api/FingerprintAPI';

export const isIntegrationTest = () => process.env.TEST_MODE === 'integration';

export const INTEGRATION_API_URL =
  process.env.TEST_API_URL ||
  'http://127.0.0.1:5001/argos-434718/us-central1/api';
export const INTEGRATION_API_KEY = process.env.TEST_API_KEY || 'test-key';

// Set up fetch polyfill for integration tests
if (isIntegrationTest()) {
  global.fetch = fetch as unknown as typeof global.fetch;
  global.Response = Response as unknown as typeof global.Response;
}

export function mockResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export function createMockFetchApi() {
  return jest.fn();
}

export class MockEnvironment implements EnvironmentInterface {
  private runtime: RuntimeEnvironment;
  private fingerprint: string;
  private currentApiKey?: string;
  private onApiKeyUpdate?: (apiKey: string) => void;

  constructor(
    fingerprint: string,
    apiKey?: string,
    onApiKeyUpdate?: (apiKey: string) => void,
    runtime: RuntimeEnvironment = RuntimeEnvironment.Browser
  ) {
    this.fingerprint = fingerprint;
    this.currentApiKey = apiKey;
    this.onApiKeyUpdate = onApiKeyUpdate;
    this.runtime = runtime;
  }

  setApiKey(apiKey: string): void {
    if (!apiKey) {
      throw new Error('API key cannot be empty');
    }
    this.currentApiKey = apiKey;
    if (this.onApiKeyUpdate) {
      this.onApiKeyUpdate(apiKey);
    }
  }

  getApiKey(): string | undefined {
    return this.currentApiKey;
  }

  createHeaders(headers: Record<string, string>): Record<string, string> {
    const result: Record<string, string> = {
      ...headers,
      'content-type': 'application/json',
      'user-agent': this.getUserAgent(),
    };

    if (this.currentApiKey) {
      result['x-api-key'] = this.currentApiKey;
    }

    return result;
  }

  async handleResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      if (response.status === 401) {
        // Handle API key invalidation
        this.currentApiKey = undefined;
      }
      const errorData = isJson
        ? await (response as unknown as { json(): Promise<any> }).json()
        : await (response as unknown as { text(): Promise<string> }).text();
      throw new Error(
        typeof errorData === 'string' ? errorData : JSON.stringify(errorData)
      );
    }

    if (!isJson) {
      return (response as unknown as { text(): Promise<string> }).text();
    }

    const data = await (response as unknown as { json(): Promise<any> }).json();

    // Check for API key in response headers
    const newApiKey = response.headers.get('x-api-key');
    if (newApiKey && newApiKey !== this.currentApiKey) {
      this.setApiKey(newApiKey);
    }

    return data;
  }

  getUserAgent(): string {
    return this.runtime === RuntimeEnvironment.Browser
      ? 'Mozilla/5.0 (Test Browser Environment)'
      : 'node-fetch/1.0 (Test Server Environment)';
  }

  getUrl(): string | null {
    return this.runtime === RuntimeEnvironment.Browser
      ? 'https://test.example.com'
      : null;
  }

  getReferrer(): string | null {
    return this.runtime === RuntimeEnvironment.Browser
      ? 'https://test-referrer.example.com'
      : null;
  }

  getLanguage(): string {
    return 'en-US';
  }

  getPlatformInfo(): string {
    return this.runtime === RuntimeEnvironment.Browser
      ? 'TestBrowser'
      : 'TestServer';
  }

  async getFingerprint(): Promise<string> {
    return this.fingerprint;
  }

  isOnline(): boolean {
    return true;
  }
}

export class MockStorage implements StorageInterface {
  private storage: Map<string, string>;

  constructor(initialData: Record<string, string> = {}) {
    this.storage = new Map(Object.entries(initialData));
  }

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

class MockHeaders extends Headers {
  constructor(init?: Record<string, string>) {
    super();
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.set(key, value);
      });
    }
  }
}

export function createMockResponse(options: {
  ok?: boolean;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: any;
}): Response {
  const {
    ok = true,
    status = 200,
    statusText = 'OK',
    headers = {},
    body = {},
  } = options;

  // Create a new Response using node-fetch
  return new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: new MockHeaders(headers),
  });
}

export class TestArgosSDK extends ArgosSDK {
  public getFingerprintAPI(): FingerprintAPI {
    return this.fingerprintAPI;
  }
}

export class TestSDK extends ArgosSDK {
  private cleanedFingerprints: Set<string> = new Set();
  private cleanedApiKeys: Set<string> = new Set();

  public async cleanup(fingerprintId: string) {
    if (this.cleanedFingerprints.has(fingerprintId)) {
      return; // Already cleaned up
    }

    try {
      // First revoke any API keys associated with this fingerprint
      const apiKeys = await this.listApiKeys();
      if (apiKeys.success && apiKeys.data) {
        for (const key of apiKeys.data) {
          if (
            key.fingerprintId === fingerprintId &&
            !this.cleanedApiKeys.has(key.key)
          ) {
            await this.cleanupApiKey(key.key);
          }
        }
      }

      // Then delete the fingerprint
      await this.fingerprintAPI.deleteFingerprint(fingerprintId);
      this.cleanedFingerprints.add(fingerprintId);
    } catch (error) {
      console.warn(`Cleanup failed for fingerprint ${fingerprintId}:`, error);
    }
  }

  public async cleanupFingerprint(fingerprintId: string) {
    if (this.cleanedFingerprints.has(fingerprintId)) {
      return; // Already cleaned up
    }

    await this.fingerprintAPI.deleteFingerprint(fingerprintId);
    this.cleanedFingerprints.add(fingerprintId);
  }

  public async cleanupApiKey(apiKey: string) {
    if (this.cleanedApiKeys.has(apiKey)) {
      return; // Already cleaned up
    }

    try {
      await this.apiKeyAPI.revokeAPIKey({ key: apiKey });
      this.cleanedApiKeys.add(apiKey);
    } catch (error) {
      if (error instanceof Error) {
        // Ignore specific error cases
        const ignoredErrors = [
          'API key is disabled',
          'API key not found',
          'API key has already been revoked',
        ];

        if (!ignoredErrors.some((msg) => error.message.includes(msg))) {
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  public resetCleanupState() {
    this.cleanedFingerprints.clear();
    this.cleanedApiKeys.clear();
  }
}
