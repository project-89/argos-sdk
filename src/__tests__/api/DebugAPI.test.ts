import { jest } from '@jest/globals';
import { DebugAPI } from '../../api/DebugAPI';
import type { DebugData } from '../../types/api';
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

describe('DebugAPI', () => {
  let api: DebugAPI;
  let mockFetchApi: ReturnType<typeof createMockFetchApi>;

  beforeEach(() => {
    mockFetchApi = createMockFetchApi();
    api = new DebugAPI({
      baseUrl: 'http://test.com',
      apiKey: 'test-key',
    });
    (api as any).fetchApi = mockFetchApi;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getDebugInfo', () => {
    it('should get debug info', async () => {
      const expectedResponse: DebugData = {
        message: 'test message',
        timestamp: Date.now(),
        data: { test: true },
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(expectedResponse));

      const result = await api.getDebugInfo();
      expect(result.data).toEqual(expectedResponse);
      expect(mockFetchApi).toHaveBeenCalledWith('/debug/info', {
        method: 'GET',
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(api.getDebugInfo()).rejects.toThrow(
        'Failed to get debug info: API Error'
      );
    });
  });
});
