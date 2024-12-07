import { APIKeyAPI } from '../../api/APIKeyAPI';
import { mockFetch, mockApiKey, mockHeaders } from '../utils/testUtils';

describe('APIKeyAPI', () => {
  let api: APIKeyAPI;
  const baseUrl = 'http://localhost:5001';

  beforeEach(() => {
    api = new APIKeyAPI(baseUrl, mockApiKey);
    global.fetch = jest.fn();
  });

  describe('register', () => {
    it('should register a new API key', async () => {
      const fingerprintId = 'test-fingerprint-id';
      const name = 'Test API Key';
      const metadata = { purpose: 'testing' };
      const agentType = 'test-agent';

      const mockResponse = {
        success: true,
        data: {
          key: 'new-api-key',
          fingerprintId,
        },
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.register({
        fingerprintId,
        name,
        metadata,
        agentType,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/apiKey/register`,
        expect.objectContaining({
          method: 'POST',
          headers: mockHeaders,
          body: JSON.stringify({
            fingerprintId,
            name,
            metadata,
            agentType,
          }),
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle missing fingerprintId', async () => {
      const mockError = {
        success: false,
        error: 'Missing required field: fingerprintId',
      };

      mockFetch(global.fetch as jest.Mock, mockError, 400);

      await expect(
        api.register({
          name: 'Test Key',
          fingerprintId: '',
        })
      ).rejects.toThrow('Missing required field: fingerprintId');
    });

    it('should handle non-existent fingerprint', async () => {
      const mockError = {
        success: false,
        error: 'Fingerprint not found',
      };

      mockFetch(global.fetch as jest.Mock, mockError, 404);

      await expect(
        api.register({
          fingerprintId: 'non-existent-id',
          name: 'Test Key',
        })
      ).rejects.toThrow('Fingerprint not found');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(
        api.register({
          fingerprintId: 'test-id',
          name: 'Test Key',
        })
      ).rejects.toThrow('Failed to register API key: Network error');
    });
  });

  describe('validate', () => {
    it('should validate an API key', async () => {
      const key = 'test-api-key';
      const mockResponse = {
        success: true,
        data: {
          isValid: true,
          fingerprintId: 'test-fingerprint-id',
        },
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.validate(key);

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/apiKey/validate`,
        expect.objectContaining({
          method: 'POST',
          headers: mockHeaders,
          body: JSON.stringify({ key }),
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle invalid API key', async () => {
      const mockResponse = {
        success: true,
        data: {
          isValid: false,
        },
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.validate('invalid-key');
      expect(result.isValid).toBe(false);
      expect(result.fingerprintId).toBeUndefined();
    });

    it('should handle missing key', async () => {
      const mockError = {
        success: false,
        error: 'Missing required field: key',
      };

      mockFetch(global.fetch as jest.Mock, mockError, 400);

      await expect(api.validate('')).rejects.toThrow(
        'Missing required field: key'
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(api.validate('test-key')).rejects.toThrow(
        'Failed to validate API key: Network error'
      );
    });
  });

  describe('revoke', () => {
    it('should revoke an API key', async () => {
      const key = 'test-api-key';
      const mockResponse = {
        success: true,
        data: {
          message: 'API key revoked successfully',
        },
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.revoke(key);

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/apiKey/revoke`,
        expect.objectContaining({
          method: 'POST',
          headers: mockHeaders,
          body: JSON.stringify({ key }),
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle non-existent API key', async () => {
      const mockError = {
        success: false,
        error: 'API key not found',
      };

      mockFetch(global.fetch as jest.Mock, mockError, 404);

      await expect(api.revoke('non-existent-key')).rejects.toThrow(
        'API key not found'
      );
    });

    it('should handle missing key', async () => {
      const mockError = {
        success: false,
        error: 'Missing required field: key',
      };

      mockFetch(global.fetch as jest.Mock, mockError, 400);

      await expect(api.revoke('')).rejects.toThrow(
        'Missing required field: key'
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(api.revoke('test-key')).rejects.toThrow(
        'Failed to revoke API key: Network error'
      );
    });
  });
});
