import { jest } from '@jest/globals';
import { TagAPI } from '../../api/TagAPI';
import type { TagData } from '../../types/api';
import { createMockFetchApi, mockResponse } from '../utils/testUtils';

// Mock BaseAPI
jest.mock('../../api/BaseAPI', () => {
  return {
    __esModule: true,
    BaseAPI: jest.fn().mockImplementation(() => ({
      fetchApi: jest.fn(),
    })),
  };
});

describe('TagAPI', () => {
  let api: TagAPI;
  let mockFetchApi: ReturnType<typeof createMockFetchApi>;

  beforeEach(() => {
    mockFetchApi = createMockFetchApi();
    api = new TagAPI({
      baseUrl: 'http://test.com',
      apiKey: 'test-key',
    });
    (api as any).fetchApi = mockFetchApi;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('updateTags', () => {
    const mockTags = ['test-tag'];
    const mockFingerprintId = 'test-fingerprint';

    it('should update tags', async () => {
      const expectedResponse: TagData = {
        fingerprintId: mockFingerprintId,
        tags: { 'test-tag': 1 },
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(expectedResponse));

      const result = await api.updateTags(mockFingerprintId, {
        tags: mockTags,
      });
      expect(result.data).toEqual(expectedResponse);
      expect(mockFetchApi).toHaveBeenCalledWith(`/tag/${mockFingerprintId}`, {
        method: 'PUT',
        body: JSON.stringify({ tags: mockTags }),
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(
        api.updateTags(mockFingerprintId, { tags: mockTags })
      ).rejects.toThrow('Failed to update tags: API Error');
    });
  });

  describe('getTags', () => {
    const mockFingerprintId = 'test-fingerprint';

    it('should get tags', async () => {
      const expectedResponse: TagData = {
        fingerprintId: mockFingerprintId,
        tags: { 'test-tag': 1 },
      };

      mockFetchApi.mockResolvedValueOnce(mockResponse(expectedResponse));

      const result = await api.getTags(mockFingerprintId);
      expect(result.data).toEqual(expectedResponse);
      expect(mockFetchApi).toHaveBeenCalledWith(`/tag/${mockFingerprintId}`, {
        method: 'GET',
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(api.getTags(mockFingerprintId)).rejects.toThrow(
        'Failed to get tags: API Error'
      );
    });
  });

  describe('deleteTags', () => {
    const mockFingerprintId = 'test-fingerprint';

    it('should delete tags', async () => {
      mockFetchApi.mockResolvedValueOnce(mockResponse(undefined));

      await api.deleteTags(mockFingerprintId);
      expect(mockFetchApi).toHaveBeenCalledWith(`/tag/${mockFingerprintId}`, {
        method: 'DELETE',
      });
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValueOnce(error);

      await expect(api.deleteTags(mockFingerprintId)).rejects.toThrow(
        'Failed to delete tags: API Error'
      );
    });
  });
});
