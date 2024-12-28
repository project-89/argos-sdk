import { jest } from '@jest/globals';
import { RoleAPI } from '../../../shared/api/RoleAPI';
import { createMockEnvironment } from '../../../__tests__/utils/testUtils';
import type { ApiResponse, RoleData } from '../../../shared/interfaces/api';
import { HttpMethod } from '../../../shared/interfaces/http';

// Unit tests with mocks
describe('RoleAPI Unit Tests', () => {
  let api: RoleAPI;
  let mockFetchApi: jest.MockedFunction<
    (path: string, options?: any) => Promise<ApiResponse<any>>
  >;

  const mockRoleData: RoleData = {
    roles: ['admin', 'moderator'],
  };

  const mockAvailableRoles = ['admin', 'moderator', 'user'];

  beforeEach(() => {
    mockFetchApi = jest.fn().mockImplementation(async () => ({
      success: true,
      data: mockRoleData,
    })) as jest.MockedFunction<
      (path: string, options?: any) => Promise<ApiResponse<any>>
    >;

    const mockEnvironment = createMockEnvironment();
    api = new RoleAPI({
      baseUrl: 'http://test.com',
      environment: mockEnvironment,
      debug: true,
    });
    (api as any).fetchApi = mockFetchApi;
  });

  describe('listAvailableRoles', () => {
    it('should call API with correct parameters', async () => {
      mockFetchApi.mockResolvedValueOnce({
        success: true,
        data: mockAvailableRoles,
      });

      await api.listAvailableRoles();

      expect(mockFetchApi).toHaveBeenCalledWith('/role', {
        method: HttpMethod.GET,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.listAvailableRoles()).rejects.toThrow();
    });
  });

  describe('getRoles', () => {
    it('should call API with correct parameters', async () => {
      mockFetchApi.mockResolvedValueOnce({
        success: true,
        data: mockRoleData,
      });

      await api.getRoles('test-fingerprint');

      expect(mockFetchApi).toHaveBeenCalledWith('/role/test-fingerprint', {
        method: HttpMethod.GET,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.getRoles('test-fingerprint')).rejects.toThrow();
    });
  });

  describe('addRoles', () => {
    it('should call API with correct parameters', async () => {
      mockFetchApi.mockResolvedValueOnce({
        success: true,
        data: mockRoleData,
      });

      await api.addRoles('test-fingerprint', ['moderator']);

      expect(mockFetchApi).toHaveBeenCalledWith('/role', {
        method: HttpMethod.POST,
        body: JSON.stringify({
          fingerprintId: 'test-fingerprint',
          roles: ['moderator'],
        }),
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(
        api.addRoles('test-fingerprint', ['moderator'])
      ).rejects.toThrow();
    });
  });

  describe('removeRoles', () => {
    it('should call API with correct parameters', async () => {
      mockFetchApi.mockResolvedValueOnce({
        success: true,
        data: mockRoleData,
      });

      await api.removeRoles('test-fingerprint', ['admin']);

      expect(mockFetchApi).toHaveBeenCalledWith('/role', {
        method: HttpMethod.DELETE,
        body: JSON.stringify({
          fingerprintId: 'test-fingerprint',
          roles: ['admin'],
        }),
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(
        api.removeRoles('test-fingerprint', ['admin'])
      ).rejects.toThrow();
    });
  });
});

// Integration tests with real API calls
describe('RoleAPI Integration Tests', () => {
  let api: RoleAPI;

  beforeAll(() => {
    // Skip integration tests if ARGOS_API_URL is not set
    if (!process.env.ARGOS_API_URL) {
      console.log('Skipping integration tests - ARGOS_API_URL not set');
      return;
    }

    const mockEnvironment = createMockEnvironment();
    api = new RoleAPI({
      baseUrl: process.env.ARGOS_API_URL,
      environment: mockEnvironment,
      debug: true,
    });
  });

  describe('listAvailableRoles', () => {
    it('should list available roles', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const result = await api.listAvailableRoles();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.every((role) => typeof role === 'string')).toBe(true);
    });
  });

  describe('getRoles', () => {
    it('should get roles for fingerprint', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const result = await api.getRoles('test-fingerprint');
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('roles');
      expect(Array.isArray(result.data.roles)).toBe(true);
    });

    it('should handle invalid fingerprint', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(api.getRoles('invalid-fingerprint')).rejects.toThrow();
    });
  });

  describe('addRoles', () => {
    it('should add roles to fingerprint', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const result = await api.addRoles('test-fingerprint', ['user']);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('roles');
      expect(Array.isArray(result.data.roles)).toBe(true);
      expect(result.data.roles).toContain('user');
    });

    it('should handle invalid fingerprint', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(
        api.addRoles('invalid-fingerprint', ['user'])
      ).rejects.toThrow();
    });
  });

  describe('removeRoles', () => {
    it('should remove roles from fingerprint', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const result = await api.removeRoles('test-fingerprint', ['user']);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('roles');
      expect(Array.isArray(result.data.roles)).toBe(true);
      expect(result.data.roles).not.toContain('user');
    });

    it('should handle invalid fingerprint', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(
        api.removeRoles('invalid-fingerprint', ['user'])
      ).rejects.toThrow();
    });
  });
});
