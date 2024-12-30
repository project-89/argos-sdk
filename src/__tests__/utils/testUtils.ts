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
import {
  Response as NodeResponse,
  RequestInit as NodeRequestInit,
  Headers,
} from 'node-fetch';

export function createMockResponse<T>(data: T, status = 200): NodeResponse {
  const responseData = { success: status >= 200 && status < 300, data };
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () => Promise.resolve(responseData),
    text: () => Promise.resolve(JSON.stringify(responseData)),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    formData: () => Promise.resolve(new FormData()),
    body: null,
    bodyUsed: false,
    clone: function () {
      return this;
    },
    buffer: () => Promise.resolve(Buffer.from('')),
    redirected: false,
    type: 'default' as ResponseType,
    url: 'https://test.example.com',
    size: 0,
    timeout: 0,
    textConverted: () => Promise.resolve(''),
  } as unknown as NodeResponse;
}

export function createMockErrorResponse(error: string): NodeResponse {
  const responseData = { success: false, error };
  return {
    ok: false,
    status: 400,
    statusText: 'Bad Request',
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () => Promise.resolve(responseData),
    text: () => Promise.resolve(JSON.stringify(responseData)),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    formData: () => Promise.resolve(new FormData()),
    body: null,
    bodyUsed: false,
    clone: function () {
      return this;
    },
    buffer: () => Promise.resolve(Buffer.from('')),
    redirected: false,
    type: 'default' as ResponseType,
    url: 'https://test.example.com',
    size: 0,
    timeout: 0,
    textConverted: () => Promise.resolve(''),
  } as unknown as NodeResponse;
}

export class MockBrowserEnvironment
  implements EnvironmentInterface<globalThis.Response>
{
  private fingerprint: string;
  private apiKey?: string;
  private userAgent?: string;
  private onApiKeyUpdate?: (apiKey: string) => void;
  readonly type = RuntimeEnvironment.Browser;

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
    return this.userAgent || 'test-fingerprint';
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

  async fetch(
    url: string,
    options?: RequestInit
  ): Promise<globalThis.Response> {
    if (url.includes('/api-key/validate')) {
      const key = this.getApiKey();
      return createMockResponse({
        isValid: key === 'test-api-key',
        key,
      }) as unknown as globalThis.Response;
    }

    const mockResponse = createMockResponse({
      status: 200,
      statusText: 'OK',
      headers: this.createHeaders({}),
      body: { success: true },
    });

    return mockResponse as unknown as globalThis.Response;
  }

  async handleResponse<U>(response: globalThis.Response): Promise<U> {
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
      platform: 'browser',
      userAgent: this.getUserAgent(),
      language: 'en-US',
      online: this.isOnline(),
      url: 'https://test.example.com',
      referrer: 'https://test-referrer.example.com',
      runtime: RuntimeEnvironment.Browser,
    };
  }

  async getFingerprint(): Promise<string> {
    return this.fingerprint;
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
