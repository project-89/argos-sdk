import {
  EnvironmentInterface,
  RuntimeEnvironment,
  StorageInterface,
} from '../../shared/interfaces/environment';
import { ArgosClientSDK } from '../../client/sdk/ArgosClientSDK';
import { ArgosServerSDK } from '../../server/sdk/ArgosServerSDK';
import type {
  ApiResponse,
  Fingerprint,
  ImpressionData,
} from '../../shared/interfaces/api';
import type {
  Response as NodeResponse,
  RequestInit as NodeRequestInit,
  ResponseType,
} from 'node-fetch';

export function createMockResponse<T>(
  data: T,
  options?: { rateLimit?: { limit: string; remaining: string; reset: string } }
): NodeResponse {
  const apiResponse: ApiResponse<T> = {
    success: true,
    data,
    error: undefined,
  };

  const headers = {
    get: (name: string) => {
      const headerMap: Record<string, string | undefined> = {
        'content-type': 'application/json',
        ...(options?.rateLimit && {
          'x-ratelimit-limit': options.rateLimit.limit,
          'x-ratelimit-remaining': options.rateLimit.remaining,
          'x-ratelimit-reset': options.rateLimit.reset,
        }),
      };
      return headerMap[name.toLowerCase()] || null;
    },
    set: jest.fn(),
    forEach: (callback: (value: string, key: string) => void) => {
      const headerMap: Record<string, string | undefined> = {
        'content-type': 'application/json',
        ...(options?.rateLimit && {
          'x-ratelimit-limit': options.rateLimit.limit,
          'x-ratelimit-remaining': options.rateLimit.remaining,
          'x-ratelimit-reset': options.rateLimit.reset,
        }),
      };
      Object.entries(headerMap).forEach(([key, value]) => {
        if (value !== undefined) {
          callback(value, key);
        }
      });
    },
  };

  const jsonString = JSON.stringify(apiResponse);
  const buffer = Buffer.from(jsonString);

  const response = {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers,
    size: buffer.length,
    timeout: 0,
    url: 'https://test.example.com',
    redirected: false,
    type: 'default' as ResponseType,
    bodyUsed: false,
    json: () => Promise.resolve(apiResponse),
    text: () => Promise.resolve(jsonString),
    buffer: () => Promise.resolve(buffer),
    arrayBuffer: () => Promise.resolve(buffer.buffer),
    blob: () => Promise.resolve(new Blob([buffer])),
    formData: () => Promise.resolve(new FormData()),
    clone: function () {
      return createMockResponse(data, options);
    },
    body: null,
  };

  return response as unknown as NodeResponse;
}

export function createMockErrorResponse(
  error: string,
  options?: { rateLimit?: { limit: string; remaining: string; reset: string } }
): NodeResponse {
  const apiResponse: ApiResponse<null> = {
    success: false,
    data: null,
    error,
  };

  const headers = new Headers({ 'content-type': 'application/json' });

  if (options?.rateLimit) {
    headers.set('x-ratelimit-limit', options.rateLimit.limit);
    headers.set('x-ratelimit-remaining', options.rateLimit.remaining);
    headers.set('x-ratelimit-reset', options.rateLimit.reset);
  }

  const jsonString = JSON.stringify(apiResponse);
  const buffer = Buffer.from(jsonString);

  const response = {
    ok: false,
    status: 400,
    statusText: 'Bad Request',
    headers,
    size: buffer.length,
    timeout: 0,
    url: 'https://test.example.com',
    redirected: false,
    type: 'default' as ResponseType,
    bodyUsed: false,
    json: () => Promise.resolve(apiResponse),
    text: () => Promise.resolve(jsonString),
    buffer: () => Promise.resolve(buffer),
    arrayBuffer: () => Promise.resolve(buffer.buffer),
    blob: () => Promise.resolve(new Blob([buffer])),
    formData: () => Promise.resolve(new FormData()),
    clone: function () {
      return createMockErrorResponse(error, options);
    },
    body: null,
  };

  return response as unknown as NodeResponse;
}

export class MockBrowserEnvironment
  implements EnvironmentInterface<Response, RequestInit>
{
  public type = RuntimeEnvironment.Test;
  private apiKey?: string;
  private fingerprint: string;
  private userAgent: string;
  public fetch: (url: string, options?: RequestInit) => Promise<Response>;

  constructor(fingerprint: string, userAgent = 'test-fingerprint') {
    this.fingerprint = fingerprint;
    this.userAgent = userAgent;
    this.fetch = jest.fn();
  }

  createHeaders(headers?: Record<string, string>): Record<string, string> {
    const result: Record<string, string> = {
      ...headers,
      'content-type': 'application/json',
      'user-agent': this.userAgent,
    };

    if (this.apiKey) {
      result['x-api-key'] = this.apiKey;
    }

    return result;
  }

  async handleResponse<U>(response: Response): Promise<U> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const error = new Error(data.error || 'Rate limit exceeded');
        (error as any).retryAfter = retryAfter ? parseInt(retryAfter, 10) : 60;
        throw error;
      }
      throw new Error(
        typeof data === 'string' ? data : data.error || 'Request failed'
      );
    }

    // Extract rate limit info
    const limit = response.headers.get('x-ratelimit-limit');
    const remaining = response.headers.get('x-ratelimit-remaining');
    const reset = response.headers.get('x-ratelimit-reset');

    // Add rate limit info to the response only if all headers are present
    if (
      typeof data === 'object' &&
      data !== null &&
      limit &&
      remaining &&
      reset
    ) {
      (data as any).rateLimitInfo = {
        limit,
        remaining,
        reset,
      };
    }

    return data;
  }

  async getFingerprint(): Promise<string> {
    return this.fingerprint;
  }

  async getPlatformInfo(): Promise<Record<string, unknown>> {
    return {
      platform: 'test',
      userAgent: this.getUserAgent(),
    };
  }

  getUserAgent(): string {
    return this.userAgent;
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  getApiKey(): string | undefined {
    return this.apiKey;
  }

  isOnline(): boolean {
    return true;
  }
}

export class MockNodeEnvironment
  implements EnvironmentInterface<NodeResponse, NodeRequestInit>
{
  private fingerprint: string;
  private apiKey?: string;
  private userAgent?: string;
  private onApiKeyUpdate?: (apiKey: string) => void;
  readonly type = RuntimeEnvironment.Node;

  constructor(
    fingerprint: string,
    apiKey?: string,
    userAgent?: string,
    onApiKeyUpdate?: (apiKey: string) => void
  ) {
    this.fingerprint = fingerprint;
    this.apiKey = apiKey;
    this.userAgent = userAgent;
    this.onApiKeyUpdate = onApiKeyUpdate;
  }

  getUserAgent(): string {
    return this.userAgent || 'Node.js Test Environment';
  }

  createHeaders(headers: Record<string, string> = {}): Record<string, string> {
    const result: Record<string, string> = {
      ...headers,
      'content-type': 'application/json',
      'user-agent': this.getUserAgent(),
    };

    if (this.apiKey) {
      result['x-api-key'] = this.apiKey;
    }

    return result;
  }

  async fetch(url: string, options?: NodeRequestInit): Promise<NodeResponse> {
    if (url.includes('/fingerprint/register')) {
      const body =
        typeof options?.body === 'string'
          ? JSON.parse(options.body)
          : (options?.body as unknown as {
              fingerprint: string;
              metadata?: Record<string, unknown>;
            });
      return createMockResponse({
        id: body.fingerprint,
        fingerprint: body.fingerprint,
        metadata: body.metadata || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (url.includes('/api-key/validate')) {
      const key = this.getApiKey();
      return createMockResponse({
        isValid: key === 'test-api-key',
        key,
      });
    }

    if (url.includes('/api-key')) {
      return createMockResponse({
        key: 'test-api-key',
        name: 'test-key',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    if (url.includes('/impression')) {
      if (options?.method === 'GET') {
        return createMockResponse([
          {
            id: 'test-impression-id',
            fingerprintId: url.split('/').pop(),
            type: 'test',
            data: { source: 'client' },
            createdAt: new Date().toISOString(),
          },
        ]);
      }

      const body =
        typeof options?.body === 'string'
          ? JSON.parse(options.body)
          : (options?.body as unknown as {
              fingerprintId: string;
              type: string;
              data: Record<string, unknown>;
            });

      return createMockResponse({
        id: 'test-impression-id',
        fingerprintId: body.fingerprintId,
        type: body.type,
        data: body.data,
        createdAt: new Date().toISOString(),
      });
    }

    return createMockResponse({
      status: 200,
      statusText: 'OK',
      headers: this.createHeaders({}),
      body: { success: true },
    });
  }

  async handleResponse<U>(response: NodeResponse): Promise<U> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      if (response.status === 401) {
        this.apiKey = undefined;
      }
      const errorData = isJson ? await response.json() : await response.text();
      throw new Error(
        typeof errorData === 'string' ? errorData : JSON.stringify(errorData)
      );
    }

    return isJson ? response.json() : response.text();
  }

  setApiKey(apiKey: string): void {
    if (!apiKey) {
      throw new Error('API key cannot be empty');
    }
    this.apiKey = apiKey;
    if (this.onApiKeyUpdate) {
      this.onApiKeyUpdate(apiKey);
    }
  }

  getApiKey(): string | undefined {
    return this.apiKey;
  }

  isOnline(): boolean {
    return true;
  }

  async getPlatformInfo(): Promise<Record<string, unknown>> {
    return {
      platform: 'node',
      arch: process.arch,
      version: process.version,
      userAgent: this.getUserAgent(),
      language: 'en-US',
      online: this.isOnline(),
      url: null,
      referrer: null,
      runtime: RuntimeEnvironment.Node,
    };
  }

  async getFingerprint(): Promise<string> {
    return this.fingerprint;
  }
}

// For backward compatibility
export const MockEnvironment = MockBrowserEnvironment;

export class MockStorage implements StorageInterface {
  private storage: Map<string, string>;

  constructor() {
    this.storage = new Map();
  }

  async get(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async set(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }
}

export function createMockFetchApi() {
  return jest.fn().mockImplementation(async () => ({
    success: true,
    data: {},
  }));
}

export function mockResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export class TestSDK extends ArgosClientSDK {
  protected cleanupQueue: string[] = [];

  async identify(data: {
    fingerprint?: string;
    metadata: Record<string, unknown>;
  }): Promise<ApiResponse<Fingerprint>> {
    const result = await super.identify(data);
    if (result.success && result.data) {
      this.cleanupQueue.push(result.data.fingerprint);
    }
    return result;
  }

  async createImpression(data: {
    fingerprintId: string;
    type: string;
    data: Record<string, unknown>;
  }): Promise<ApiResponse<ImpressionData>> {
    const result = await super.createImpression(data);
    this.cleanupQueue.push(data.fingerprintId);
    return result;
  }

  async cleanup(fingerprintId: string): Promise<void> {
    if (this.cleanupQueue.includes(fingerprintId)) {
      await super.deleteImpressions(fingerprintId);
      this.cleanupQueue = this.cleanupQueue.filter(
        (id) => id !== fingerprintId
      );
    }
  }

  resetCleanupState(): void {
    this.cleanupQueue = [];
  }
}

export class TestServerSDK extends ArgosServerSDK {
  private cleanupQueue: string[] = [];

  async identify(data: {
    fingerprint: string;
    metadata: Record<string, unknown>;
  }): Promise<ApiResponse<Fingerprint>> {
    const result = await super.identify(data);
    this.cleanupQueue.push(data.fingerprint);
    return result;
  }

  async createImpression(data: {
    fingerprintId: string;
    type: string;
    data: Record<string, unknown>;
  }): Promise<ApiResponse<ImpressionData>> {
    const result = await super.createImpression(data);
    this.cleanupQueue.push(data.fingerprintId);
    return result;
  }

  async cleanup(fingerprintId: string): Promise<void> {
    if (this.cleanupQueue.includes(fingerprintId)) {
      await super.deleteImpressions(fingerprintId);
      this.cleanupQueue = this.cleanupQueue.filter(
        (id) => id !== fingerprintId
      );
    }
  }

  resetCleanupState(): void {
    this.cleanupQueue = [];
  }
}
