import { jest } from '@jest/globals';
import { RoleAPI } from '../../../shared/api/RoleAPI';
import { MockEnvironment } from '../../../__tests__/utils/testUtils';
import { HttpMethod, CommonResponse } from '../../../shared/interfaces/http';
import type { RoleData } from '../../../shared/interfaces/api';

describe('RoleAPI', () => {
  let api: RoleAPI<CommonResponse>;
  let mockFetchApi: jest.Mock;

  const mockRoleData: RoleData = {
    roles: ['admin', 'user'],
  };

  beforeEach(() => {
    mockFetchApi = jest.fn(() =>
      Promise.resolve({
        success: true,
        data: mockRoleData,
      })
    );

    const mockEnvironment = new MockEnvironment('test-fingerprint');
    api = new RoleAPI<CommonResponse>({
      baseUrl: 'http://test.com',
      environment: mockEnvironment,
      debug: true,
    });
    (api as any).fetchApi = mockFetchApi;
  });

  describe('listAvailableRoles', () => {
    it('should call API with correct parameters', async () => {
      await api.listAvailableRoles();

      expect(mockFetchApi).toHaveBeenCalledWith('/role', {
        method: HttpMethod.GET,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockImplementationOnce(() =>
        Promise.reject(new Error('API Error'))
      );
      await expect(api.listAvailableRoles()).rejects.toThrow();
    });
  });

  describe('addRoles', () => {
    it('should call API with correct parameters', async () => {
      const roles = ['admin', 'user'];
      await api.addRoles('test-fingerprint-id', roles);

      expect(mockFetchApi).toHaveBeenCalledWith('/role', {
        method: HttpMethod.POST,
        body: {
          fingerprintId: 'test-fingerprint-id',
          roles,
        },
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockImplementationOnce(() =>
        Promise.reject(new Error('API Error'))
      );
      await expect(
        api.addRoles('test-fingerprint-id', ['admin'])
      ).rejects.toThrow();
    });
  });

  describe('getRoles', () => {
    it('should call API with correct parameters', async () => {
      await api.getRoles('test-fingerprint-id');

      expect(mockFetchApi).toHaveBeenCalledWith('/role/test-fingerprint-id', {
        method: HttpMethod.GET,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockImplementationOnce(() =>
        Promise.reject(new Error('API Error'))
      );
      await expect(api.getRoles('test-fingerprint-id')).rejects.toThrow();
    });
  });

  describe('removeRoles', () => {
    it('should call API with correct parameters', async () => {
      const roles = ['admin', 'user'];
      await api.removeRoles('test-fingerprint-id', roles);

      expect(mockFetchApi).toHaveBeenCalledWith('/role', {
        method: HttpMethod.DELETE,
        body: {
          fingerprintId: 'test-fingerprint-id',
          roles,
        },
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockImplementationOnce(() =>
        Promise.reject(new Error('API Error'))
      );
      await expect(
        api.removeRoles('test-fingerprint-id', ['admin'])
      ).rejects.toThrow();
    });
  });
});
