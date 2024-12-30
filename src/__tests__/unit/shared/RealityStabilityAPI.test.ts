import { jest } from '@jest/globals';
import {
  RealityStabilityAPI,
  StabilityData,
} from '../../../shared/api/RealityStabilityAPI';
import {
  MockBrowserEnvironment,
  createMockResponse,
} from '../../utils/testUtils';
import { HttpMethod } from '../../../shared/interfaces/http';
import type { Response, RequestInit } from 'node-fetch';

type FetchFunction = (url: string, init?: RequestInit) => Promise<Response>;

describe('RealityStabilityAPI', () => {
  const BASE_URL = 'https://test.example.com';
  let api: RealityStabilityAPI<Response, RequestInit>;
  let mockFetch: jest.MockedFunction<FetchFunction>;
  let mockEnvironment: MockBrowserEnvironment;

  const mockStabilityData: StabilityData = {
    status: 'stable',
    lastChecked: '2023-01-01T00:00:00Z',
    metrics: {
      reliability: 0.99,
      latency: 150,
    },
  };

  beforeEach(() => {
    mockEnvironment = new MockBrowserEnvironment('test-fingerprint');
    mockFetch = jest.fn<FetchFunction>();
    mockEnvironment.fetch = mockFetch as any;
    api = new RealityStabilityAPI({
      baseUrl: BASE_URL,
      environment: mockEnvironment as any,
    });
  });

  describe('getCurrentStability', () => {
    it('should call API with correct parameters', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(mockStabilityData));

      await api.getCurrentStability();

      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/stability/current`, {
        method: HttpMethod.GET,
        headers: {
          'user-agent': 'test-fingerprint',
          'content-type': 'application/json',
        },
      });
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.getCurrentStability()).rejects.toThrow();
    });
  });
});
