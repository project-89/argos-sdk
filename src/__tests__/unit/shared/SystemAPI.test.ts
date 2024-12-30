import { jest } from '@jest/globals';
import {
  SystemAPI,
  HealthCheckResponse,
  RoleInfo,
} from '../../../shared/api/SystemAPI';
import {
  MockBrowserEnvironment,
  createMockResponse,
} from '../../utils/testUtils';
import { HttpMethod } from '../../../shared/interfaces/http';
import type { Response, RequestInit } from 'node-fetch';

type FetchFunction = (url: string, init?: RequestInit) => Promise<Response>;

describe('SystemAPI', () => {
  const BASE_URL = 'https://test.example.com';
  let api: SystemAPI<Response, RequestInit>;
  let mockFetch: jest.MockedFunction<FetchFunction>;
  let mockEnvironment: MockBrowserEnvironment;

  beforeEach(() => {
    mockEnvironment = new MockBrowserEnvironment('test-fingerprint');
    mockFetch = jest.fn<FetchFunction>();
    mockEnvironment.fetch = mockFetch as any;
    api = new SystemAPI({
      baseUrl: BASE_URL,
      environment: mockEnvironment as any,
    });
  });

  describe('checkHealth', () => {
    it('should call API with correct parameters', async () => {
      const mockHealthData: HealthCheckResponse = {
        status: 'healthy',
        version: '1.0.0',
        uptime: 3600,
      };

      mockFetch.mockResolvedValueOnce(createMockResponse(mockHealthData));

      await api.checkHealth();

      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/health`, {
        method: HttpMethod.GET,
        headers: {
          'user-agent': 'test-fingerprint',
          'content-type': 'application/json',
        },
      });
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.checkHealth()).rejects.toThrow();
    });
  });

  describe('getAvailableRoles', () => {
    it('should call API with correct parameters', async () => {
      const mockRoles: RoleInfo[] = [
        {
          id: 'admin',
          name: 'Administrator',
          description: 'Full system access',
          permissions: ['read', 'write', 'delete'],
        },
      ];

      mockFetch.mockResolvedValueOnce(createMockResponse(mockRoles));

      await api.getAvailableRoles();

      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/roles`, {
        method: HttpMethod.GET,
        headers: {
          'content-type': 'application/json',
          'user-agent': 'test-fingerprint',
        },
      });
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.getAvailableRoles()).rejects.toThrow();
    });
  });
});
