import { jest } from '@jest/globals';
import { RealityStabilityAPI } from '../../../shared/api/RealityStabilityAPI';
import type { RealityStabilityData } from '../../../shared/interfaces/api';
import {
  createMockFetchApi,
  mockResponse,
  MockEnvironment,
} from '../../utils/testUtils';
import { RuntimeEnvironment } from '../../../shared/interfaces/environment';

// Mock BaseAPI
jest.mock('../../../shared/api/BaseAPI', () => {
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
      environment: new MockEnvironment(
        'test-fingerprint',
        'test-api-key',
        undefined,
        RuntimeEnvironment.Node
      ),
      debug: true,
    });
    (api as any).fetchApi = mockFetchApi;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getCurrentStability', () => {
    it('should get current stability successfully', async () => {
      const mockStabilityData: RealityStabilityData = {
        stability: 0.85,
        timestamp: '2023-01-01T00:00:00Z',
        factors: {
          coherence: 0.9,
          consistency: 0.8,
          entropy: 0.85,
        },
        trend: 'stable',
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(mockStabilityData));

      const result = await api.getCurrentStability();

      expect(result.data).toEqual(mockStabilityData);
      expect(mockFetchApi).toHaveBeenCalledWith('/reality-stability', {
        method: 'GET',
      });
    });
  });
});
