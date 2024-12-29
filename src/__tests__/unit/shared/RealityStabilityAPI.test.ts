import { RealityStabilityAPI } from '../../../shared/api/RealityStabilityAPI';
import { MockEnvironment } from '../../../__tests__/utils/testUtils';
import { HttpMethod, CommonResponse } from '../../../shared/interfaces/http';

describe('RealityStabilityAPI', () => {
  let api: RealityStabilityAPI<CommonResponse>;
  let mockFetchApi: jest.MockedFunction<any>;

  beforeEach(() => {
    mockFetchApi = jest.fn().mockResolvedValue({
      success: true,
      data: {
        stability: 0.95,
        timestamp: new Date().toISOString(),
      },
    });

    const mockEnvironment = new MockEnvironment('test-fingerprint');
    api = new RealityStabilityAPI<CommonResponse>({
      baseUrl: 'http://test.com',
      environment: mockEnvironment,
      debug: true,
    });
    (api as any).fetchApi = mockFetchApi;
  });

  describe('getCurrentStability', () => {
    it('should call API with correct parameters', async () => {
      await api.getCurrentStability();

      expect(mockFetchApi).toHaveBeenCalledWith('/reality-stability', {
        method: HttpMethod.GET,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.getCurrentStability()).rejects.toThrow(
        'Failed to get reality stability: API Error'
      );
    });
  });
});
