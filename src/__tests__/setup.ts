import '@testing-library/jest-dom';

// Mock window.crypto for fingerprint generation
const mockCrypto = {
  getRandomValues: (arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  },
};

// Mock window.crypto
Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
});

// For integration tests, use real fetch
if (process.env.TEST_MODE === 'integration') {
  const fetch = require('node-fetch');
  global.fetch = fetch;
  global.Headers = fetch.Headers;
} else {
  // For unit tests, use mock fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, data: {} }),
      headers: new Map(),
    })
  ) as jest.Mock;

  // Mock Headers for unit tests
  class HeadersPolyfill {
    private headers: Map<string, string>;

    constructor(init?: Record<string, string>) {
      this.headers = new Map();
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this.set(key, value);
        });
      }
    }

    append(name: string, value: string): void {
      this.set(name, value);
    }

    delete(name: string): void {
      this.headers.delete(name.toLowerCase());
    }

    get(name: string): string | null {
      return this.headers.get(name.toLowerCase()) || null;
    }

    has(name: string): boolean {
      return this.headers.has(name.toLowerCase());
    }

    set(name: string, value: string): void {
      this.headers.set(name.toLowerCase(), value);
    }

    forEach(callback: (value: string, key: string) => void): void {
      this.headers.forEach((value, key) => callback(value, key));
    }
  }

  // @ts-expect-error - Mocking Headers
  global.Headers = HeadersPolyfill;
}
