import { jest } from '@jest/globals';
import { SystemAPI } from '../../../shared/api/SystemAPI';
import { MockEnvironment } from '../../../__tests__/utils/testUtils';
import type {
  ApiResponse,
  SystemHealthData,
} from '../../../shared/interfaces/api';
import { HttpMethod } from '../../../shared/interfaces/http';

describe('SystemAPI Unit Tests', () => {
  let api: SystemAPI<Response>;
  let mockFetchApi: jest.MockedFunction<
    (path: string, options?: any) => Promise<ApiResponse<any>>
  >;

  const mockHealthData: SystemHealthData = {
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  };

  beforeEach(() => {
    mockFetchApi = jest.fn().mockImplementation(async () => ({
      success: true,
      data: mockHealthData,
    })) as jest.MockedFunction<
      (path: string, options?: any) => Promise<ApiResponse<any>>
    >;

    const mockEnvironment = new MockEnvironment('test-fingerprint');
    api = new SystemAPI<Response>({
      baseUrl: 'http://test.com',
      environment: mockEnvironment,
      debug: true,
    });
    (api as any).fetchApi = mockFetchApi;
  });

  describe('checkHealth', () => {
    it('should call API with correct parameters', async () => {
      await api.checkHealth();

      expect(mockFetchApi).toHaveBeenCalledWith('/health', {
        method: HttpMethod.GET,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.checkHealth()).rejects.toThrow();
    });
  });

  describe('getAvailableRoles', () => {
    it('should call API with correct parameters', async () => {
      const mockRoles = ['admin', 'user'];
      mockFetchApi.mockResolvedValueOnce({
        success: true,
        data: mockRoles,
      });

      await api.getAvailableRoles();

      expect(mockFetchApi).toHaveBeenCalledWith('/role/available', {
        method: HttpMethod.GET,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.getAvailableRoles()).rejects.toThrow();
    });
  });
});
