import { jest } from '@jest/globals';
import { BaseAPI } from '../../api/BaseAPI';
import { ApiResponse } from '../../types/api';
import { EnvironmentInterface } from '../../core/interfaces/environment';
import { StorageInterface } from '../../core/interfaces/environment';

// Mock fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Mock environment
const mockEnvironment: EnvironmentInterface = {
  getUserAgent: () => 'test-user-agent',
  getFingerprint: async () => 'test-fingerprint',
  getPlatformInfo: () => 'test-platform',
  isOnline: () => true,
  getLanguage: () => 'en-US',
  getUrl: () => 'https://test.com',
  getReferrer: () => 'https://referrer.com',
};

// Mock the implementation of each method
jest.spyOn(mockEnvironment, 'getUserAgent');
jest.spyOn(mockEnvironment, 'getFingerprint');
jest.spyOn(mockEnvironment, 'getPlatformInfo');
jest.spyOn(mockEnvironment, 'isOnline');
jest.spyOn(mockEnvironment, 'getLanguage');
jest.spyOn(mockEnvironment, 'getUrl');
jest.spyOn(mockEnvironment, 'getReferrer');

// Mock storage
const mockStorage: StorageInterface = {
  getItem: jest.fn((key: string) => null),
  setItem: jest.fn((key: string, value: string) => {}),
  removeItem: jest.fn((key: string) => {}),
  clear: jest.fn(() => {}),
};

// Test API implementation
class TestAPI extends BaseAPI {
  public async testFetch<T>(endpoint: string, options = {}): Promise<T> {
    return this.fetchApi(endpoint, options);
  }
}

describe('BaseAPI', () => {
  let api: TestAPI;

  beforeEach(() => {
    api = new TestAPI({
      baseUrl: 'http://localhost',
      apiKey: 'test-api-key',
      environment: mockEnvironment,
      storage: mockStorage,
      debug: true,
    });
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Unit Tests', () => {
    describe('Authentication', () => {
      it('should include API key in headers', async () => {
        const mockResponse = {
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: {} }),
          headers: new Headers({ 'Content-Type': 'application/json' }),
        } as Response;
        mockFetch.mockResolvedValueOnce(mockResponse);

        await api.testFetch('/test');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost/test',
          expect.objectContaining({
            headers: expect.any(Headers),
          })
        );

        const headers = mockFetch.mock.calls[0]?.[1]?.headers as Headers;
        expect(headers.get('X-API-Key')).toBe('test-api-key');
      });

      // ... rest of the tests ...
    });
  });
});
