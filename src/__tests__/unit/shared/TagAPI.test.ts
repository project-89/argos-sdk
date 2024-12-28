import { jest } from '@jest/globals';
import { TagAPI } from '../../../shared/api/TagAPI';
import type { ApiResponse, TagData } from '../../../shared/interfaces/api';
import { createMockEnvironment } from '../../../__tests__/utils/testUtils';
import { HttpMethod } from '../../../shared/interfaces/http';

// Unit tests with mocks
describe('TagAPI Unit Tests', () => {
  let api: TagAPI;
  let mockFetchApi: jest.MockedFunction<
    (path: string, options?: any) => Promise<ApiResponse<any>>
  >;

  const mockTagData: TagData = {
    tags: ['tag1', 'tag2'],
    metadata: { test: 'data' },
  };

  beforeEach(() => {
    mockFetchApi = jest.fn().mockImplementation(async () => ({
      success: true,
      data: mockTagData,
    })) as jest.MockedFunction<
      (path: string, options?: any) => Promise<ApiResponse<any>>
    >;

    const mockEnvironment = createMockEnvironment();
    api = new TagAPI({
      baseUrl: 'http://test.com',
      environment: mockEnvironment,
      debug: true,
    });
    (api as any).fetchApi = mockFetchApi;
  });

  describe('updateTags', () => {
    it('should call API with correct parameters', async () => {
      const request = {
        tags: ['tag1', 'tag2'],
        metadata: { test: 'data' },
      };

      await api.updateTags('test-fingerprint', request);

      expect(mockFetchApi).toHaveBeenCalledWith('/tag/test-fingerprint', {
        method: HttpMethod.PUT,
        body: JSON.stringify(request),
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(
        api.updateTags('test-fingerprint', { tags: [] })
      ).rejects.toThrow('Failed to update tags: API Error');
    });
  });

  describe('getTags', () => {
    it('should call API with correct parameters', async () => {
      await api.getTags('test-fingerprint');

      expect(mockFetchApi).toHaveBeenCalledWith('/tag/test-fingerprint', {
        method: HttpMethod.GET,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.getTags('test-fingerprint')).rejects.toThrow(
        'Failed to get tags: API Error'
      );
    });
  });

  describe('deleteTags', () => {
    it('should call API with correct parameters', async () => {
      await api.deleteTags('test-fingerprint');

      expect(mockFetchApi).toHaveBeenCalledWith('/tag/test-fingerprint', {
        method: HttpMethod.DELETE,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockRejectedValueOnce(new Error('API Error'));
      await expect(api.deleteTags('test-fingerprint')).rejects.toThrow(
        'Failed to delete tags: API Error'
      );
    });
  });
});

// Integration tests with real API calls
describe('TagAPI Integration Tests', () => {
  let api: TagAPI;

  beforeAll(() => {
    // Skip integration tests if ARGOS_API_URL is not set
    if (!process.env.ARGOS_API_URL) {
      console.log('Skipping integration tests - ARGOS_API_URL not set');
      return;
    }

    const mockEnvironment = createMockEnvironment();
    api = new TagAPI({
      baseUrl: process.env.ARGOS_API_URL,
      environment: mockEnvironment,
      debug: true,
    });
  });

  describe('updateTags', () => {
    it('should update tags', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const request = {
        tags: ['test-tag-1', 'test-tag-2'],
        metadata: { test: 'data' },
      };

      const result = await api.updateTags('test-fingerprint', request);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('tags');
      expect(result.data.tags).toEqual(request.tags);
      expect(result.data).toHaveProperty('metadata');
      expect(result.data.metadata).toEqual(request.metadata);
    });

    it('should handle invalid fingerprint', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(
        api.updateTags('invalid-fingerprint', { tags: [] })
      ).rejects.toThrow();
    });
  });

  describe('getTags', () => {
    it('should get tags', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      const result = await api.getTags('test-fingerprint');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('tags');
      expect(Array.isArray(result.data.tags)).toBe(true);
      expect(result.data).toHaveProperty('metadata');
    });

    it('should handle invalid fingerprint', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(api.getTags('invalid-fingerprint')).rejects.toThrow();
    });
  });

  describe('deleteTags', () => {
    it('should delete tags', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      // First, add some tags
      await api.updateTags('test-fingerprint', {
        tags: ['tag-to-delete'],
      });

      // Then delete them
      await api.deleteTags('test-fingerprint');

      // Verify tags were deleted
      const result = await api.getTags('test-fingerprint');
      expect(result.data.tags).toEqual([]);
    });

    it('should handle invalid fingerprint', async () => {
      if (!process.env.ARGOS_API_URL) {
        return;
      }
      await expect(api.deleteTags('invalid-fingerprint')).rejects.toThrow();
    });
  });
});
