import { jest } from '@jest/globals';
import { SystemAPI } from '../../../shared/api/SystemAPI';
import type {
  ApiResponse,
  SystemHealthData,
} from '../../../shared/interfaces/api';
import { createMockEnvironment } from '../../../__tests__/utils/testUtils';
import { HttpMethod } from '../../../shared/interfaces/http';

// Unit tests with mocks
describe('SystemAPI Unit Tests', () => {
  let api: SystemAPI;
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

    const mockEnvironment = createMockEnvironment();
    api = new SystemAPI({
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
      await expect(api.checkHealth()).rejects.toThrow(
        'Failed to check system health: API Error'
      );
    });

    it('should return health data', async () => {
      const result = await api.checkHealth();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockHealthData);
    });
  });

  describe('getAvailableRoles', () => {
    const mockRoles = ['admin', 'user', 'guest'];

    beforeEach(() => {
      mockFetchApi.mockImplementation(async () => ({
        success: true,
        data: mockRoles,
      }));
    });

    it('should call API with correct parameters', async () => {
      await api.getAvailableRoles();

      expect(mockFetchApi).toHaveBeenCalledWith('/role/available', {
        method: HttpMethod.GET,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.getAvailableRoles()).rejects.toThrow(
        'Failed to get available roles: API Error'
      );
    });

    it('should return available roles', async () => {
      const result = await api.getAvailableRoles();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRoles);
    });
  });
});

// Integration tests with real API calls
describe('SystemAPI Integration Tests', () => {
  let api: SystemAPI;

  beforeAll(() => {
    // Skip integration tests if ARGOS_API_URL is not set
    if (!process.env.ARGOS_API_URL) {
      console.log('Skipping integration tests - ARGOS_API_URL not set');
      return;
    }

    const mockEnvironment = createMockEnvironment();
    api = new SystemAPI({
      baseUrl: process.env.ARGOS_API_URL,
      environment: mockEnvironment,
      debug: true,
    });
  });

  describe('checkHealth', () => {
    it('should check system health', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const result = await api.checkHealth();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('status');
      expect(result.data).toHaveProperty('version');
      expect(result.data).toHaveProperty('timestamp');
    });
  });

  describe('getAvailableRoles', () => {
    it('should get available roles', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const result = await api.getAvailableRoles();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      if (result.data.length > 0) {
        expect(typeof result.data[0]).toBe('string');
      }
    });
  });
});
