import { jest } from '@jest/globals';
import { TagAPI } from '../../../shared/api/TagAPI';
import { HttpMethod } from '../../../shared/interfaces/http';
import { TestEnvironment } from './mocks/TestEnvironment';
import { createMockResponse } from '../../utils/testUtils';

const BASE_URL = 'https://test.example.com';
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof global.fetch;

describe('TagAPI', () => {
  let api: TagAPI<Response>;
  let environment: TestEnvironment;

  beforeEach(() => {
    jest.clearAllMocks();
    environment = new TestEnvironment();
    api = new TagAPI({
      baseUrl: BASE_URL,
      environment,
    });

    mockFetch.mockImplementation(() =>
      Promise.resolve(
        createMockResponse(
          { tags: ['tag1', 'tag2'] },
          {
            rateLimit: {
              limit: '1000',
              remaining: '999',
              reset: Date.now().toString(),
            },
          }
        )
      )
    );
  });

  it('should update tags', async () => {
    const request = {
      tags: ['tag1', 'tag2'],
    };

    await api.updateTags('test-fingerprint-id', request);

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/tag/test-fingerprint-id`,
      {
        method: HttpMethod.PUT,
        body: JSON.stringify(request),
        headers: {
          'content-type': 'application/json',
          'user-agent': 'test-fingerprint',
        },
      }
    );
  });

  it('should get tags', async () => {
    await api.getTags('test-fingerprint-id');

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/tag/test-fingerprint-id`,
      {
        method: HttpMethod.GET,
        headers: {
          'content-type': 'application/json',
          'user-agent': 'test-fingerprint',
        },
      }
    );
  });

  it('should delete tags', async () => {
    await api.deleteTags('test-fingerprint-id');

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/tag/test-fingerprint-id`,
      {
        method: HttpMethod.DELETE,
        headers: {
          'content-type': 'application/json',
          'user-agent': 'test-fingerprint',
        },
      }
    );
  });

  it('should handle API errors', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        headers: new Headers({
          'content-type': 'application/json',
          'X-RateLimit-Limit': '1000',
          'X-RateLimit-Remaining': '999',
          'X-RateLimit-Reset': Date.now().toString(),
        }),
        json: () => Promise.resolve({ success: false, error: 'Test error' }),
      } as Response)
    );

    await expect(api.getTags('test-fingerprint-id')).rejects.toThrow();
  });
});
