import { VisitAPI } from '../../api/VisitAPI';
import { mockFetch, mockApiKey, mockHeaders } from '../utils/testUtils';

describe('VisitAPI', () => {
  let api: VisitAPI;
  const baseUrl = 'http://localhost:5001';

  beforeEach(() => {
    api = new VisitAPI(baseUrl, mockApiKey);
    global.fetch = jest.fn();
  });

  describe('logVisit', () => {
    it('should log a visit with API key', async () => {
      const visitData = {
        fingerprintId: 'test-fingerprint',
        url: 'https://example.com',
        metadata: { referrer: 'google.com' },
      };

      const mockResponse = {
        success: true,
        data: {
          id: 'visit-123',
          ...visitData,
          timestamp: new Date().toISOString(),
        },
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.logVisit(visitData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/visit/log`,
        expect.objectContaining({
          method: 'POST',
          headers: mockHeaders,
          body: JSON.stringify(visitData),
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle network errors', async () => {
      const visitData = {
        fingerprintId: 'test-fingerprint',
        url: 'https://example.com',
      };

      // Simulate network failure
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(api.logVisit(visitData)).rejects.toThrow(
        'Failed to log visit: Network error'
      );
    });

    it('should handle malformed responses', async () => {
      const visitData = {
        fingerprintId: 'test-fingerprint',
        url: 'https://example.com',
      };

      // Simulate malformed JSON response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(api.logVisit(visitData)).rejects.toThrow(
        'Failed to parse visit response'
      );
    });
  });

  describe('updatePresence', () => {
    it('should update presence status', async () => {
      const presenceData = {
        fingerprintId: 'test-fingerprint',
        status: 'online',
        url: 'https://example.com',
      };

      const mockResponse = {
        success: true,
        data: {
          id: 'presence-123',
          ...presenceData,
          lastUpdated: new Date().toISOString(),
        },
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.updatePresence(presenceData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/visit/presence`,
        expect.objectContaining({
          method: 'POST',
          headers: mockHeaders,
          body: JSON.stringify(presenceData),
        })
      );

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getHistory', () => {
    it('should get visit history for fingerprint', async () => {
      const fingerprintId = 'test-fingerprint';
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'visit-1',
            fingerprintId,
            url: 'https://example.com',
            timestamp: new Date().toISOString(),
          },
          {
            id: 'visit-2',
            fingerprintId,
            url: 'https://example.com/page',
            timestamp: new Date().toISOString(),
          },
        ],
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.getHistory(fingerprintId);

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/visit/history/${fingerprintId}`,
        expect.objectContaining({
          method: 'GET',
          headers: mockHeaders,
        })
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should handle empty history', async () => {
      const fingerprintId = 'test-fingerprint';
      const mockResponse = {
        success: true,
        data: [],
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.getHistory(fingerprintId);
      expect(result).toEqual([]);
    });
  });

  describe('removeSite', () => {
    it('should remove site from visit history', async () => {
      const data = {
        fingerprintId: 'test-fingerprint',
        url: 'https://example.com',
      };

      const mockResponse = {
        success: true,
        data: { removed: true },
      };

      mockFetch(global.fetch as jest.Mock, mockResponse);

      const result = await api.removeSite(data);

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/visit/site/remove`,
        expect.objectContaining({
          method: 'POST',
          headers: mockHeaders,
          body: JSON.stringify(data),
        })
      );

      expect(result).toBe(true);
    });
  });
});
