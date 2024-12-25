import { ApiResponse } from '../../types/api';
import fetch, { Response } from 'node-fetch';
import {
  EnvironmentInterface,
  StorageInterface,
} from '../../core/interfaces/environment';

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
  private fingerprint: string;

  constructor(fingerprint: string = 'test-fingerprint') {
    this.fingerprint = fingerprint;
  }

  async getFingerprint(): Promise<string> {
    return this.fingerprint;
  }

  getPlatformInfo(): string {
    return 'test-platform';
  }

  isOnline(): boolean {
    return true;
  }

  getLanguage(): string {
    return 'en-US';
  }

  getUserAgent(): string {
    return 'test-user-agent';
  }

  getUrl(): string | null {
    return 'http://test.com';
  }

  getReferrer(): string | null {
    return null;
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

class MockHeaders {
  private headers: Map<string, string>;

  constructor(init?: Record<string, string>) {
    this.headers = new Map(Object.entries(init || {}));
  }

  append(name: string, value: string): void {
    const existing = this.headers.get(name);
    this.headers.set(name, existing ? `${existing}, ${value}` : value);
  }

  delete(name: string): void {
    this.headers.delete(name);
  }

  get(name: string): string | null {
    return this.headers.get(name) || null;
  }

  has(name: string): boolean {
    return this.headers.has(name);
  }

  set(name: string, value: string): void {
    this.headers.set(name, value);
  }

  forEach(
    callbackfn: (value: string, key: string, parent: Headers) => void
  ): void {
    this.headers.forEach((value, key) =>
      callbackfn(value, key, this as unknown as Headers)
    );
  }

  entries(): IterableIterator<[string, string]> {
    return this.headers.entries();
  }

  keys(): IterableIterator<string> {
    return this.headers.keys();
  }

  values(): IterableIterator<string> {
    return this.headers.values();
  }

  [Symbol.iterator](): IterableIterator<[string, string]> {
    return this.entries();
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

  const mockResponse = {
    ok,
    status,
    statusText,
    redirected: false,
    type: 'default' as ResponseType,
    url: 'http://test.com',
    headers: new MockHeaders(headers),
    body: null,
    bodyUsed: false,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    clone: () => createMockResponse(options),
  };

  return mockResponse as unknown as Response;
}
