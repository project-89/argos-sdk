import { jest } from '@jest/globals';
import { BaseAPI } from '../../../shared/api/BaseAPI';
import { HttpMethod } from '../../../shared/interfaces/http';
import { TestEnvironment } from './mocks/TestEnvironment';
import type { BaseAPIRequestOptions } from '../../../shared/api/BaseAPI';
import type { ApiResponse } from '../../../shared/interfaces/api';

const BASE_URL = 'https://test.example.com';
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof global.fetch;

class TestAPI extends BaseAPI<Response, RequestInit> {
  constructor() {
    super({
      baseUrl: BASE_URL,
      environment: new TestEnvironment(),
    });
  }

  async testFetch<T>(
    path: string,
    options?: BaseAPIRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.fetchApi<T>(path, options);
  }
}

describe('BaseAPI', () => {
  let api: TestAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    api = new TestAPI();

    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { test: 'data' } }),
      } as Response)
    );
  });

  it('should call fetch with correct parameters', async () => {
    const testData = { test: 'data' };
    await api.testFetch('/test', {
      method: HttpMethod.POST,
      body: JSON.stringify(testData),
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/test`, {
      method: HttpMethod.POST,
      body: JSON.stringify(testData),
      headers: {
        'content-type': 'application/json',
        'user-agent': 'test-fingerprint',
      },
    });
  });

  it('should handle API errors', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ success: false, error: 'Test error' }),
      } as Response)
    );

    await expect(
      api.testFetch('/test', {
        method: HttpMethod.POST,
        body: JSON.stringify({ test: 'data' }),
      })
    ).rejects.toThrow();
  });
});
