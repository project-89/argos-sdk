import { jest } from '@jest/globals';
import { ImpressionAPI } from '../../../shared/api/ImpressionAPI';
import { HttpMethod } from '../../../shared/interfaces/http';
import { TestEnvironment } from './mocks/TestEnvironment';
import type { ImpressionData } from '../../../shared/interfaces/api';
import { createMockResponse } from '../../utils/testUtils';

const BASE_URL = 'https://test.example.com';
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof global.fetch;

describe('ImpressionAPI', () => {
  let api: ImpressionAPI<Response>;
  let environment: TestEnvironment;

  const mockImpressionData: ImpressionData = {
    id: 'test-impression-id',
    fingerprintId: 'test-fingerprint-id',
    type: 'test-type',
    data: { key: 'value' },
    createdAt: new Date().toISOString(),
    source: 'test-source',
    sessionId: 'test-session',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    environment = new TestEnvironment();
    api = new ImpressionAPI({
      baseUrl: BASE_URL,
      environment,
    });

    mockFetch.mockImplementation(() =>
      Promise.resolve(
        createMockResponse(mockImpressionData, {
          rateLimit: {
            limit: '1000',
            remaining: '999',
            reset: Date.now().toString(),
          },
        })
      )
    );
  });

  it('should create impression', async () => {
    const request = {
      fingerprintId: 'test-fingerprint-id',
      type: 'test-type',
      data: { key: 'value' },
      source: 'test-source',
      sessionId: 'test-session',
    };

    await api.createImpression(request);

    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/impressions`, {
      method: HttpMethod.POST,
      body: JSON.stringify(request),
      headers: {
        'content-type': 'application/json',
        'user-agent': 'test-fingerprint',
      },
    });
  });

  it('should get impressions', async () => {
    const options = {
      type: 'test-type',
      startTime: '2023-01-01',
      endTime: '2023-01-02',
      limit: 10,
      sessionId: 'test-session',
    };

    await api.getImpressions('test-fingerprint-id', options);

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/impressions/test-fingerprint-id?type=test-type&startTime=2023-01-01&endTime=2023-01-02&limit=10&sessionId=test-session`,
      {
        method: HttpMethod.GET,
        headers: {
          'content-type': 'application/json',
          'user-agent': 'test-fingerprint',
        },
      }
    );
  });

  it('should delete impressions', async () => {
    const fingerprintId = 'test-fingerprint-id';
    const type = 'test-type';

    await api.deleteImpressions(fingerprintId, type);

    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_URL}/impressions/test-fingerprint-id?type=test-type`,
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

    await expect(
      api.createImpression({
        fingerprintId: 'test-fingerprint-id',
        type: 'test-type',
        data: {},
      })
    ).rejects.toThrow();
  });
});
