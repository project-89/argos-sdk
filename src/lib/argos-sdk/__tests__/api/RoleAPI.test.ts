import { RoleAPI } from '../../api/RoleAPI';
import { mockFetch, mockApiKey, mockHeaders } from '../utils/testUtils';

describe('RoleAPI', () => {
  let api: RoleAPI;
  const baseUrl = 'http://localhost:5001';

  beforeEach(() => {
    api = new RoleAPI(baseUrl, mockApiKey);
    global.fetch = jest.fn();
  });

  describe('assign', () => {
    it('should assign a role to a fingerprint', async () => {
      const roleData = {
        fingerprintId: 'test-fingerprint',
        role: 'premium',
      };

      const mockResponse = {
        success: true,
        data: {
          fingerprintId: 'test-fingerprint',
          role: 'premium',
          roles: ['user', 'premium'],
        },
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.assign(roleData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/role/assign`,
        expect.objectContaining({
          method: 'POST',
          headers: mockHeaders,
          body: JSON.stringify(roleData),
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle invalid role errors', async () => {
      const roleData = {
        fingerprintId: 'test-fingerprint',
        role: 'invalid-role',
      };

      const mockError = {
        success: false,
        error: 'Invalid role',
      };

      mockFetch(global.fetch as jest.Mock, mockError, 400);

      await expect(api.assign(roleData)).rejects.toThrow('Invalid role');
    });

    it('should handle network errors', async () => {
      const roleData = {
        fingerprintId: 'test-fingerprint',
        role: 'premium',
      };

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(api.assign(roleData)).rejects.toThrow(
        'Failed to assign role: Network error'
      );
    });
  });

  describe('remove', () => {
    it('should remove a role from a fingerprint', async () => {
      const roleData = {
        fingerprintId: 'test-fingerprint',
        role: 'premium',
      };

      const mockResponse = {
        success: true,
        data: {
          fingerprintId: 'test-fingerprint',
          role: 'premium',
          roles: ['user'],
        },
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.remove(roleData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/role/remove`,
        expect.objectContaining({
          method: 'POST',
          headers: mockHeaders,
          body: JSON.stringify(roleData),
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should prevent removing user role', async () => {
      const roleData = {
        fingerprintId: 'test-fingerprint',
        role: 'user',
      };

      const mockError = {
        success: false,
        error: 'Cannot remove user role',
      };

      mockFetch(global.fetch as jest.Mock, mockError, 400);

      await expect(api.remove(roleData)).rejects.toThrow(
        'Cannot remove user role'
      );
    });
  });

  describe('getAvailable', () => {
    it('should get list of available roles', async () => {
      const mockResponse = {
        success: true,
        data: ['user', 'premium', 'vip', 'admin'],
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.getAvailable();

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/role/available`,
        expect.objectContaining({
          method: 'GET',
          headers: mockHeaders,
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle empty role list', async () => {
      const mockResponse = {
        success: true,
        data: [],
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.getAvailable();
      expect(result).toEqual([]);
    });

    it('should handle malformed responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(api.getAvailable()).rejects.toThrow(
        'Failed to parse available roles'
      );
    });
  });
});
