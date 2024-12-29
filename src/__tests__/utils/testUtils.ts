import type { Response as NodeResponse } from 'node-fetch';
import type {
  ApiResponse,
  ImpressionData,
  Fingerprint,
  ValidateAPIKeyResponse,
} from '../../shared/interfaces/api';
import type {
  EnvironmentInterface,
  StorageInterface,
} from '../../shared/interfaces/environment';
import { RuntimeEnvironment } from '../../shared/interfaces/environment';
import { ArgosClientSDK } from '../../client/sdk/ArgosClientSDK';
import type { SDKOptions } from '../../shared/interfaces/sdk';
import { ImpressionAPI } from '../../shared/api/ImpressionAPI';
import { ArgosServerSDK } from '../../server/sdk/ArgosServerSDK';
import { APIKeyAPI } from '../../shared/api/APIKeyAPI';

export function createMockResponse(options: {
  ok?: boolean;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: any;
}): Response {
  const { status = 200, statusText = 'OK', headers = {}, body = {} } = options;
  const responseInit = {
    status,
    statusText,
    headers: new Headers(headers),
  };

  return new Response(JSON.stringify(body), responseInit);
}

export class MockBrowserEnvironment implements EnvironmentInterface<Response> {
  private fingerprint: string;
  private apiKey?: string;
  private userAgent?: string;

  constructor(fingerprint: string, apiKey?: string, userAgent?: string) {
    this.fingerprint = fingerprint;
    this.apiKey = apiKey;
    this.userAgent = userAgent;
  }

  getUserAgent(): string {
    return this.userAgent || 'Mozilla/5.0 (Test Browser Environment)';
  }

  createHeaders(headers: Record<string, string>): Record<string, string> {
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

  async fetch(_url: string, _init?: RequestInit): Promise<Response> {
    return createMockResponse({
      status: 200,
      statusText: 'OK',
      headers: this.createHeaders({}),
      body: { success: true },
    });
  }

  async handleResponse(response: Response): Promise<unknown> {
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
    this.apiKey = apiKey;
  }

  getApiKey(): string | undefined {
    return this.apiKey;
  }

  isOnline(): boolean {
    return true;
  }

  getLanguage(): string {
    return 'en-US';
  }

  async getPlatformInfo(): Promise<Record<string, unknown>> {
    return {
      platform: 'browser',
      userAgent: this.getUserAgent(),
      language: this.getLanguage(),
      online: this.isOnline(),
      url: this.getUrl(),
      referrer: this.getReferrer(),
      runtime: RuntimeEnvironment.Browser,
    };
  }

  async getFingerprint(): Promise<string> {
    return this.fingerprint;
  }

  getUrl(): string {
    return 'https://test.example.com';
  }

  getReferrer(): string | null {
    return 'https://test-referrer.example.com';
  }
}

export class MockNodeEnvironment implements EnvironmentInterface<NodeResponse> {
  private fingerprint: string;
  private apiKey?: string;
  private userAgent?: string;

  constructor(fingerprint: string, apiKey?: string, userAgent?: string) {
    this.fingerprint = fingerprint;
    this.apiKey = apiKey;
    this.userAgent = userAgent;
  }

  getUserAgent(): string {
    return this.userAgent || 'Node.js Test Environment';
  }

  createHeaders(headers: Record<string, string>): Record<string, string> {
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

  async fetch(_url: string, _init?: RequestInit): Promise<NodeResponse> {
    const headers = new Headers(this.createHeaders({}));
    const body = JSON.stringify({ success: true });

    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers,
      json: () => Promise.resolve(JSON.parse(body)),
      text: () => Promise.resolve(body),
      buffer: () => Promise.resolve(Buffer.from(body)),
      arrayBuffer: () => Promise.resolve(Buffer.from(body)),
      formData: () => Promise.reject(new Error('Not implemented')),
      blob: () => Promise.reject(new Error('Not implemented')),
      bodyUsed: false,
      size: 0,
      timeout: 0,
      url: _url,
      clone: function () {
        return this;
      },
      type: 'default',
      redirected: false,
      body: null,
    };

    return response as unknown as NodeResponse;
  }

  async handleResponse(response: NodeResponse): Promise<unknown> {
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
    this.apiKey = apiKey;
  }

  getApiKey(): string | undefined {
    return this.apiKey;
  }

  isOnline(): boolean {
    return true;
  }

  getLanguage(): string {
    return 'en-US';
  }

  async getPlatformInfo(): Promise<Record<string, unknown>> {
    return {
      platform: 'node',
      userAgent: this.getUserAgent(),
      language: this.getLanguage(),
      online: this.isOnline(),
      url: this.getUrl(),
      referrer: this.getReferrer(),
      runtime: RuntimeEnvironment.Node,
    };
  }

  async getFingerprint(): Promise<string> {
    return this.fingerprint;
  }

  getUrl(): string | null {
    return null;
  }

  getReferrer(): string | null {
    return null;
  }
}

// For backward compatibility
export const MockEnvironment = MockBrowserEnvironment;

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
  private apiKeyAPI: APIKeyAPI<Response>;
  private impressionAPI: ImpressionAPI<Response>;
  private cleanupComplete = false;

  constructor(options: SDKOptions) {
    super(options);
    this.apiKeyAPI = new APIKeyAPI<Response>({
      baseUrl: options.baseUrl,
      apiKey: options.apiKey,
      environment: options.environment,
      debug: options.debug,
    });
    this.impressionAPI = new ImpressionAPI<Response>({
      baseUrl: options.baseUrl,
      apiKey: options.apiKey,
      environment: options.environment,
      debug: options.debug,
    });
  }

  async validateApiKey(
    apiKey: string
  ): Promise<ApiResponse<ValidateAPIKeyResponse>> {
    return this.apiKeyAPI.validateAPIKey(apiKey);
  }

  async createImpression(request: any): Promise<ApiResponse<ImpressionData>> {
    return this.impressionAPI.createImpression(request);
  }

  async cleanup(fingerprintId: string): Promise<void> {
    if (this.cleanupComplete) {
      return;
    }
    try {
      await this.impressionAPI.deleteImpressions(fingerprintId);
      this.cleanupComplete = true;
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  }

  resetCleanupState(): void {
    this.cleanupComplete = false;
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
      await this.deleteImpressions(fingerprintId);
      this.cleanupQueue = this.cleanupQueue.filter(
        (id) => id !== fingerprintId
      );
    }
  }

  resetCleanupState(): void {
    this.cleanupQueue = [];
  }
}
