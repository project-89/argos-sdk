import { jest } from '@jest/globals';
import { ApiResponse } from '../../types/api';

export const mockResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
});

export const createMockFetch = () =>
  jest.fn<typeof fetch>().mockImplementation(() =>
    Promise.resolve(
      createMockResponse({
        body: { success: true, data: {} },
      })
    )
  );

export const createMockFetchApi = <T = any>() =>
  jest
    .fn<() => Promise<ApiResponse<T>>>()
    .mockImplementation(() => Promise.resolve(mockResponse({} as T)));

export const mockBaseAPI = jest.fn(() => ({
  __esModule: true,
  BaseAPI: jest.fn().mockImplementation(() => ({
    fetchApi: createMockFetchApi(),
  })),
}));

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

export const createMockResponse = (options: {
  ok?: boolean;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: any;
}): Response => {
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
    bytes: () => Promise.resolve(new Uint8Array()),
  };

  return mockResponse as unknown as Response;
};
