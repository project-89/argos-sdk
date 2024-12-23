import { jest } from '@jest/globals';
import { RealityStabilityAPI } from '../../api/RealityStabilityAPI';
import type { RealityStabilityData } from '../../types/api';
import { createMockFetchApi, mockResponse } from '../utils/testUtils';

// Mock BaseAPI
jest.mock('../../api/BaseAPI', () => {
  return {
    __esModule: true,
    BaseAPI: jest.fn().mockImplementation(() => ({
      fetchApi: jest.fn(),
    })),
  };
});

describe('RealityStabilityAPI', () => {
  let api: RealityStabilityAPI;
  let mockFetchApi: ReturnType<typeof createMockFetchApi>;

  beforeEach(() => {
    mockFetchApi = createMockFetchApi();
    api = new RealityStabilityAPI({
      baseUrl: 'http://test.com',
      apiKey: 'test-key',
    });
    (api as any).fetchApi = mockFetchApi;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getCurrentStability', () => {
    it('should get current stability', async () => {
      const expectedResponse: RealityStabilityData = {
        stability: 0.85,
        timestamp: new Date().toISOString(),
        factors: { test: 1.0 },
        trend: 'stable',
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(expectedResponse));

      const result = await api.getCurrentStability();
      expect(result.data).toEqual(expectedResponse);
      expect(mockFetchApi).toHaveBeenCalledWith('/reality-stability', {
        method: 'GET',
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(api.getCurrentStability()).rejects.toThrow(
        'Failed to get current stability: API Error'
      );
    });
  });
});
