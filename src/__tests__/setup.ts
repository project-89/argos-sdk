import { jest } from '@jest/globals';

// Only set up browser mocks if we're in a jsdom environment
if (process.env.JEST_ENVIRONMENT === 'jsdom') {
  // Mock crypto for browser environment
  const crypto = {
    randomUUID: () => 'test-uuid',
    getRandomValues: (arr: Uint8Array) => arr,
    subtle: {},
  };

  Object.defineProperty(window, 'crypto', {
    value: crypto,
    writable: true,
  });

  Object.defineProperty(window, 'navigator', {
    value: {
      userAgent: 'test-user-agent',
      language: 'en-US',
      onLine: true,
    },
    writable: true,
  });

  Object.defineProperty(window, 'document', {
    value: {
      referrer: 'http://localhost/referrer',
      cookie: '',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    writable: true,
  });
}

// Mock Response if it's not defined (Node.js environment)
if (typeof Response === 'undefined') {
  class ResponseClass {
    private _body: string;
    private _status: number;
    private _headers: Map<string, string>;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this._body = body?.toString() || '';
      this._status = init?.status || 200;
      this._headers = new Map(
        Object.entries(init?.headers || {}).map(([k, v]) => [
          k.toLowerCase(),
          v.toString(),
        ])
      );
    }

    get status() {
      return this._status;
    }

    get ok() {
      return this._status >= 200 && this._status < 300;
    }

    get headers() {
      return {
        get: (name: string) => this._headers.get(name.toLowerCase()),
      };
    }

    async json() {
      return JSON.parse(this._body);
    }

    async text() {
      return this._body;
    }

    static error() {
      return new ResponseClass(null, { status: 500 });
    }
  }

  global.Response = ResponseClass as any;
}

// Mock fetch for both environments
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: new Headers(),
  })
) as unknown as typeof fetch;
