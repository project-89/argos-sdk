import type { ApiResponse } from '../../shared/interfaces/api';
import type {
  EnvironmentInterface,
  StorageInterface,
} from '../../shared/interfaces/environment';
import { RuntimeEnvironment } from '../../shared/interfaces/environment';

export const createMockEnvironment = (
  overrides: Partial<EnvironmentInterface> = {}
): EnvironmentInterface => {
  let apiKey: string | undefined;

  return {
    isOnline: () => true,
    getLanguage: () => 'en-US',
    getUserAgent: () => 'Mozilla/5.0 (Test Environment)',
    getPlatformInfo: () => Promise.resolve({ platform: 'test' }),
    getFingerprint: () => Promise.resolve('test-fingerprint'),
    getUrl: () => 'https://test.example.com',
    getReferrer: () => null,
    setApiKey: (key: string) => {
      apiKey = key;
    },
    getApiKey: () => apiKey,
    createHeaders: (headers: Record<string, string>) => headers,
    handleResponse: async (response: Response) => {
      if (!response.ok) {
        if (response.status === 401) {
          apiKey = undefined;
        }
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        const errorData = isJson
          ? await response.json()
          : await response.text();
        throw new Error(
          typeof errorData === 'string' ? errorData : JSON.stringify(errorData)
        );
      }
      return response.json();
    },
    fetch: async (_url: string, _init?: RequestInit): Promise<Response> => {
      const response = new Response(JSON.stringify({ success: true }), {
        status: 200,
        statusText: 'OK',
        headers: {},
      });
      return response;
    },
    ...overrides,
  };
};

export class MockEnvironment implements EnvironmentInterface {
  private fingerprint: string;
  private apiKey?: string;
  private userAgent?: string;
  private runtimeEnvironment: RuntimeEnvironment;

  constructor(
    fingerprint: string,
    apiKey?: string,
    userAgent?: string,
    runtimeEnvironment: RuntimeEnvironment = RuntimeEnvironment.Node
  ) {
    this.fingerprint = fingerprint;
    this.apiKey = apiKey;
    this.userAgent = userAgent;
    this.runtimeEnvironment = runtimeEnvironment;
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
    const response = new Response(JSON.stringify({ success: true }), {
      status: 200,
      statusText: 'OK',
      headers: this.createHeaders({}),
    });
    return response;
  }

  async handleResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      if (response.status === 401) {
        // Handle API key invalidation
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
      platform:
        this.runtimeEnvironment === RuntimeEnvironment.Browser
          ? 'browser'
          : 'node',
      userAgent: this.getUserAgent(),
      language: this.getLanguage(),
      online: this.isOnline(),
      url: this.getUrl(),
      referrer: this.getReferrer(),
      runtime: this.runtimeEnvironment,
    };
  }

  async getFingerprint(): Promise<string> {
    return this.fingerprint;
  }

  getUrl(): string | null {
    return this.runtimeEnvironment === RuntimeEnvironment.Browser
      ? 'https://test.example.com'
      : null;
  }

  getReferrer(): string | null {
    return this.runtimeEnvironment === RuntimeEnvironment.Browser
      ? 'https://test-referrer.example.com'
      : null;
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

export function createMockResponse(options: {
  ok?: boolean;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: any;
}): Response {
  const { status = 200, statusText = 'OK', headers = {}, body = {} } = options;

  return new Response(JSON.stringify(body), {
    status,
    statusText,
    headers,
  });
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
