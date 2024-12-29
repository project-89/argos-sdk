import { DebugAPI } from '../../../shared/api/DebugAPI';
import { MockEnvironment } from '../../../__tests__/utils/testUtils';
import { HttpMethod, CommonResponse } from '../../../shared/interfaces/http';

describe('DebugAPI', () => {
  let debugAPI: DebugAPI<CommonResponse>;
  let mockFetchApi: jest.MockedFunction<any>;

  beforeEach(() => {
    mockFetchApi = jest.fn().mockResolvedValue({
      success: true,
      data: { debug: 'info' },
    });

    const mockEnvironment = new MockEnvironment('test-fingerprint');
    debugAPI = new DebugAPI<CommonResponse>({
      baseUrl: 'http://test.com',
      environment: mockEnvironment,
      debug: true,
    });
    (debugAPI as any).fetchApi = mockFetchApi;
  });

  describe('getDebugInfo', () => {
    it('should call API with correct parameters', async () => {
      await debugAPI.getDebugInfo();

      expect(mockFetchApi).toHaveBeenCalledWith('/debug/info', {
        method: HttpMethod.GET,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(debugAPI.getDebugInfo()).rejects.toThrow(
        'Failed to get debug info: API Error'
      );
    });
  });
});
