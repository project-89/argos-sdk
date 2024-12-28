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

    storage = new CookieStorage({
      secure: true,
      sameSite: 'strict',
    });
    storage.clear();
    environment = new BrowserEnvironment(storage);
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

  describe('getLanguage', () => {
    it('should return navigator.language', () => {
      expect(environment.getLanguage()).toBe(navigator.language);
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
    it('should set and get API key', () => {
      environment.setApiKey('test-api-key');
      expect(environment.getApiKey()).toBe('test-api-key');
    });

    it('should throw error when setting empty API key', () => {
      expect(() => environment.setApiKey('')).toThrow(
        'API key cannot be empty'
      );
    });

    it('should call onApiKeyUpdate callback when API key is set', () => {
      const callback = jest.fn();
      environment = new BrowserEnvironment(storage, callback);
      environment.setApiKey('test-api-key');
      expect(callback).toHaveBeenCalledWith('test-api-key');
    });
  });

  describe('Headers management', () => {
    it('should create headers with API key when available', () => {
      environment.setApiKey('test-api-key');
      const headers = environment.createHeaders({});
      expect(headers['x-api-key']).toBe('test-api-key');
      expect(headers['user-agent']).toBe(navigator.userAgent);
    });

    it('should create headers without API key when not available', () => {
      const headers = environment.createHeaders({});
      expect(headers['x-api-key']).toBeUndefined();
      expect(headers['user-agent']).toBe(navigator.userAgent);
    });
  });

  describe('Response handling', () => {
    it('should handle JSON response', async () => {
      const mockResponse = new Response(JSON.stringify({ test: 'data' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
      const result = await environment.handleResponse(mockResponse);
      expect(result).toEqual({ test: 'data' });
    });

    it('should handle text response', async () => {
      const mockResponse = new Response('test data', {
        status: 200,
        headers: { 'content-type': 'text/plain' },
      });
      const result = await environment.handleResponse(mockResponse);
      expect(result).toBe('test data');
    });

    it('should handle error response and clear API key on 401', async () => {
      environment.setApiKey('test-api-key');
      const mockResponse = new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'content-type': 'application/json' },
        }
      );
      await expect(environment.handleResponse(mockResponse)).rejects.toThrow();
      expect(environment.getApiKey()).toBeUndefined();
    });
  });

  describe('URL and referrer', () => {
    it('should return current URL', () => {
      expect(environment.getUrl()).toBe(window.location.href);
    });

    it('should return document referrer', () => {
      expect(environment.getReferrer()).toBe(document.referrer);
    });
  });
});
