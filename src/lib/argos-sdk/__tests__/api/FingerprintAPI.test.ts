import { FingerprintAPI } from '../../api/FingerprintAPI';
import { mockFetch, MockResponse } from '../utils/testUtils';

describe('FingerprintAPI', () => {
  let api: FingerprintAPI;
  const baseUrl = 'http://localhost:5001';

  beforeEach(() => {
    api = new FingerprintAPI(baseUrl);
    global.fetch = jest.fn();
  });

  describe('register', () => {
    it('should register a new fingerprint', async () => {
      const mockFingerprint = {
        fingerprint: 'test-fingerprint',
        metadata: { test: true },
      };

      const mockResponse = {
        success: true,
        data: {
          id: 'test-id',
          fingerprint: 'test-fingerprint',
          roles: ['user'],
          createdAt: new Date().toISOString(),
          metadata: { test: true },
          tags: {},
        },
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.register(
        mockFingerprint.fingerprint,
        mockFingerprint.metadata
      );

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/fingerprint/register`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockFingerprint),
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle registration errors', async () => {
      const mockError = {
        success: false,
        error: 'Registration failed',
      };

      mockFetch(global.fetch as jest.Mock, mockError, 400);

      await expect(api.register('test-fingerprint')).rejects.toThrow(
        'Registration failed'
      );
    });
  });

  describe('get', () => {
    it('should get fingerprint by ID', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'test-id',
          fingerprint: 'test-fingerprint',
          roles: ['user'],
          createdAt: new Date().toISOString(),
          metadata: {},
          tags: {},
        },
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.get('test-id');

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/fingerprint/test-id`,
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle not found errors', async () => {
      const mockError = {
        success: false,
        error: 'Fingerprint not found',
      };

      mockFetch(global.fetch as jest.Mock, mockError, 404);

      await expect(api.get('non-existent')).rejects.toThrow(
        'Fingerprint not found'
      );
    });
  });
});
