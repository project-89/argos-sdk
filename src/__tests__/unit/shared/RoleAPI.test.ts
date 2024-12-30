import { jest } from '@jest/globals';
import { RoleAPI } from '../../../shared/api/RoleAPI';
import {
  MockBrowserEnvironment,
  createMockResponse,
} from '../../utils/testUtils';
import { HttpMethod } from '../../../shared/interfaces/http';
import type { Response, RequestInit } from 'node-fetch';
import type { RoleData } from '../../../shared/interfaces/api';

type FetchFunction = (url: string, init?: RequestInit) => Promise<Response>;

describe('RoleAPI', () => {
  const BASE_URL = 'https://test.example.com';
  let api: RoleAPI<Response, RequestInit>;
  let mockFetch: jest.MockedFunction<FetchFunction>;
  let mockEnvironment: MockBrowserEnvironment;

  const mockRoleData: RoleData = {
    roles: ['admin', 'user'],
  };

  beforeEach(() => {
    mockEnvironment = new MockBrowserEnvironment('test-fingerprint');
    mockFetch = jest.fn<FetchFunction>();
    mockEnvironment.fetch = mockFetch as any;
    api = new RoleAPI({
      baseUrl: BASE_URL,
      environment: mockEnvironment as any,
    });
  });

  describe('getAvailableRoles', () => {
    it('should call API with correct parameters', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(mockRoleData));

      await api.getAvailableRoles();

      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/role/available`, {
        method: HttpMethod.GET,
        headers: {
          'user-agent': 'test-fingerprint',
          'content-type': 'application/json',
        },
      });
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.getAvailableRoles()).rejects.toThrow();
    });
  });

  describe('addRolesToFingerprint', () => {
    it('should call API with correct parameters', async () => {
      const roles = ['admin', 'user'];
      mockFetch.mockResolvedValueOnce(createMockResponse(mockRoleData));

      await api.addRolesToFingerprint('test-fingerprint-id', roles);

      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/role`, {
        method: HttpMethod.POST,
        body: {
          fingerprintId: 'test-fingerprint-id',
          roles,
        },
        headers: {
          'content-type': 'application/json',
          'user-agent': 'test-fingerprint',
        },
      });
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
      await expect(
        api.addRolesToFingerprint('test-fingerprint-id', ['admin'])
      ).rejects.toThrow();
    });
  });

  describe('getFingerprintRoles', () => {
    it('should call API with correct parameters', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(mockRoleData));

      await api.getFingerprintRoles('test-fingerprint-id');

      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/role/test-fingerprint-id`,
        {
          method: HttpMethod.GET,
          headers: {
            'user-agent': 'test-fingerprint',
            'content-type': 'application/json',
          },
        }
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
      await expect(
        api.getFingerprintRoles('test-fingerprint-id')
      ).rejects.toThrow();
    });
  });

  describe('removeRolesFromFingerprint', () => {
    it('should call API with correct parameters', async () => {
      const roles = ['admin', 'user'];
      mockFetch.mockResolvedValueOnce(createMockResponse(undefined));

      await api.removeRolesFromFingerprint('test-fingerprint-id', roles);

      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/role`, {
        method: HttpMethod.DELETE,
        body: {
          fingerprintId: 'test-fingerprint-id',
          roles,
        },
        headers: {
          'content-type': 'application/json',
          'user-agent': 'test-fingerprint',
        },
      });
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
      await expect(
        api.removeRolesFromFingerprint('test-fingerprint-id', ['admin'])
      ).rejects.toThrow();
    });
  });
});
