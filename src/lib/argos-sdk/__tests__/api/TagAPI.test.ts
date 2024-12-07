import { TagAPI } from '../../api/TagAPI';
import { mockFetch, mockApiKey, mockHeaders } from '../utils/testUtils';

describe('TagAPI', () => {
  let api: TagAPI;
  const baseUrl = 'http://localhost:5001';

  beforeEach(() => {
    api = new TagAPI(baseUrl, mockApiKey);
    global.fetch = jest.fn();
  });

  describe('updateTags', () => {
    it('should update tags for a fingerprint', async () => {
      const fingerprintId = 'test-fingerprint-id';
      const tags = {
        visits: 5,
        timeSpent: 300,
      };

      const mockResponse = {
        success: true,
        data: {
          fingerprintId,
          tags,
        },
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.updateTags(fingerprintId, tags);

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tag/update`,
        expect.objectContaining({
          method: 'POST',
          headers: mockHeaders,
          body: JSON.stringify({ fingerprintId, tags }),
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle invalid fingerprint', async () => {
      const mockError = {
        success: false,
        error: 'Fingerprint not found',
      };

      mockFetch(global.fetch as jest.Mock, mockError, 404);

      await expect(api.updateTags('invalid-id', { visits: 5 })).rejects.toThrow(
        'Fingerprint not found'
      );
    });

    it('should handle invalid tag values', async () => {
      const mockError = {
        success: false,
        error: "Invalid value for tag 'visits': must be a number",
      };

      mockFetch(global.fetch as jest.Mock, mockError, 400);

      await expect(
        api.updateTags('test-id', { visits: 'invalid' as any })
      ).rejects.toThrow("Invalid value for tag 'visits': must be a number");
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(api.updateTags('test-id', { visits: 5 })).rejects.toThrow(
        'Failed to update tags: Network error'
      );
    });
  });

  describe('updateRolesByTags', () => {
    it('should update roles based on tag rules', async () => {
      const fingerprintId = 'test-fingerprint-id';
      const tagRules = {
        visits: {
          min: 5,
          role: 'premium',
        },
        timeSpent: {
          min: 300,
          role: 'vip',
        },
      };

      const mockResponse = {
        success: true,
        data: {
          fingerprintId,
          roles: ['premium', 'vip', 'user'],
        },
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.updateRolesByTags(fingerprintId, tagRules);

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/tag/roles/update`,
        expect.objectContaining({
          method: 'POST',
          headers: mockHeaders,
          body: JSON.stringify({ fingerprintId, tagRules }),
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle invalid fingerprint', async () => {
      const mockError = {
        success: false,
        error: 'Fingerprint not found',
      };

      mockFetch(global.fetch as jest.Mock, mockError, 404);

      await expect(
        api.updateRolesByTags('invalid-id', {
          visits: { min: 5, role: 'premium' },
        })
      ).rejects.toThrow('Fingerprint not found');
    });

    it('should handle invalid tag rule format', async () => {
      const mockError = {
        success: false,
        error: "Invalid min value for tag 'visits': must be a number",
      };

      mockFetch(global.fetch as jest.Mock, mockError, 400);

      await expect(
        api.updateRolesByTags('test-id', {
          visits: { min: 'invalid' as any, role: 'premium' },
        })
      ).rejects.toThrow("Invalid min value for tag 'visits': must be a number");
    });

    it('should handle invalid role names', async () => {
      const mockError = {
        success: false,
        error: 'Invalid role: invalid-role',
      };

      mockFetch(global.fetch as jest.Mock, mockError, 400);

      await expect(
        api.updateRolesByTags('test-id', {
          visits: { min: 5, role: 'invalid-role' },
        })
      ).rejects.toThrow('Invalid role: invalid-role');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(
        api.updateRolesByTags('test-id', {
          visits: { min: 5, role: 'premium' },
        })
      ).rejects.toThrow('Failed to update roles: Network error');
    });
  });
});
