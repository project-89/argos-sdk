/**
 * @jest-environment jsdom
 */

import { BrowserEnvironment } from '../../../client/environment/BrowserEnvironment';
import { CookieStorage } from '../../../client/storage/CookieStorage';
import { RuntimeEnvironment } from '../../../shared/interfaces/environment';

// Mock js-cookie
jest.mock('js-cookie', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

// Import the mock after mocking
import Cookies from 'js-cookie';

describe('BrowserEnvironment', () => {
  let environment: BrowserEnvironment;
  let storage: CookieStorage;
  let mockCookies: { [key: string]: string } = {};

  beforeEach(() => {
    mockCookies = {};
    (Cookies.get as jest.Mock).mockImplementation((key?: string) =>
      key ? mockCookies[key] : mockCookies
    );
    (Cookies.set as jest.Mock).mockImplementation(
      (key: string, value: string) => {
        mockCookies[key] = value;
      }
    );
    (Cookies.remove as jest.Mock).mockImplementation((key: string) => {
      delete mockCookies[key];
    });

    storage = new CookieStorage();
    storage.clear();
    environment = new BrowserEnvironment();
  });

  afterEach(() => {
    storage.clear();
    jest.clearAllMocks();
  });

  describe('isOnline', () => {
    it('should return true when navigator.onLine is true', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        configurable: true,
      });
      expect(environment.isOnline()).toBe(true);
    });

    it('should return false when navigator.onLine is false', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
      });
      expect(environment.isOnline()).toBe(false);
    });
  });

  describe('getUserAgent', () => {
    it('should return navigator.userAgent', () => {
      expect(environment.getUserAgent()).toBe(navigator.userAgent);
    });
  });

  describe('getPlatformInfo', () => {
    it('should return platform information', async () => {
      const info = await environment.getPlatformInfo();
      expect(info.platform).toBe('browser');
      expect(info.userAgent).toBe(navigator.userAgent);
      expect(info.runtime).toBe(RuntimeEnvironment.Browser);
    });
  });

  describe('API key management', () => {
    it('should set and get API key', async () => {
      await environment.setApiKey('test-api-key');
      expect(environment.getApiKey()).toBe('test-api-key');
    });

    it('should throw error when setting empty API key', async () => {
      await expect(environment.setApiKey('')).rejects.toThrow(
        'API key cannot be empty'
      );
    });
  });

  describe('Headers management', () => {
    it('should create headers with API key when available', async () => {
      await environment.setApiKey('test-api-key');
      const headers = environment.createHeaders({});
      expect(headers['x-api-key']).toBe('test-api-key');
      expect(headers['user-agent']).toBe(navigator.userAgent);
    });

    it('should create headers without API key when not available', () => {
      const headers = environment.createHeaders({});
      expect(headers['x-api-key']).toBe('');
      expect(headers['user-agent']).toBe(navigator.userAgent);
    });
  });

  describe('Response Handling', () => {
    it('should include rate limit information in successful responses', async () => {
      const now = Date.now();
      const mockHeaders = {
        get: jest.fn((key: string) => {
          const headers: Record<string, string> = {
            'content-type': 'application/json',
            'x-ratelimit-limit': '1000',
            'x-ratelimit-remaining': '999',
            'x-ratelimit-reset': now.toString(),
          };
          return headers[key.toLowerCase()] || null;
        }),
      };

      const mockResponse = {
        ok: true,
        status: 200,
        headers: mockHeaders,
        json: () => Promise.resolve({ data: { test: true } }),
        text: () => Promise.resolve(JSON.stringify({ data: { test: true } })),
      } as unknown as Response;

      const result = await environment.handleResponse<{
        test: boolean;
        rateLimitInfo?: {
          limit: string;
          remaining: string;
          reset: string;
        };
      }>(mockResponse);

      expect(result).toHaveProperty('rateLimitInfo');
      expect(result.rateLimitInfo).toEqual({
        limit: '1000',
        remaining: '999',
        reset: now.toString(),
      });
    });

    it('should handle rate limit exceeded errors', async () => {
      const now = Date.now();
      const mockHeaders = {
        get: jest.fn((key: string) => {
          const headers: Record<string, string> = {
            'content-type': 'application/json',
            'retry-after': '60',
            'x-ratelimit-limit': '1000',
            'x-ratelimit-remaining': '0',
            'x-ratelimit-reset': now.toString(),
          };
          return headers[key.toLowerCase()] || null;
        }),
      };

      const mockResponse = {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: mockHeaders,
        json: () =>
          Promise.resolve({
            success: false,
            error: 'Rate limit exceeded',
          }),
        text: () =>
          Promise.resolve(
            JSON.stringify({
              success: false,
              error: 'Rate limit exceeded',
            })
          ),
      } as unknown as Response;

      try {
        await environment.handleResponse(mockResponse);
        fail('Should have thrown an error');
      } catch (error: any) {
        const errorData = JSON.parse(error.message);
        expect(errorData).toEqual({
          error: 'Rate limit exceeded',
          retryAfter: '60',
          rateLimitInfo: {
            limit: '1000',
            remaining: '0',
            reset: expect.any(String),
          },
          details: {
            success: false,
            error: 'Rate limit exceeded',
          },
        });
      }
    });

    it('should not include rate limit info when headers are not present', async () => {
      const mockHeaders = {
        get: jest.fn((key: string) => {
          const headers: Record<string, string> = {
            'content-type': 'application/json',
          };
          return headers[key.toLowerCase()] || null;
        }),
      };

      const mockResponse = {
        ok: true,
        status: 200,
        headers: mockHeaders,
        json: () =>
          Promise.resolve({
            success: true,
            data: { test: true },
          }),
        text: () =>
          Promise.resolve(
            JSON.stringify({
              success: true,
              data: { test: true },
            })
          ),
      } as unknown as Response;

      const result = await environment.handleResponse<{
        success: boolean;
        data: { test: boolean };
        rateLimitInfo?: {
          limit: string;
          remaining: string;
          reset: string;
        };
      }>(mockResponse);

      expect(result.rateLimitInfo).toBeUndefined();
    });
  });
});
