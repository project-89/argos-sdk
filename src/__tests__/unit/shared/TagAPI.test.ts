import { jest } from '@jest/globals';
import { TagAPI } from '../../../shared/api/TagAPI';
import { MockEnvironment } from '../../../__tests__/utils/testUtils';
import { HttpMethod, CommonResponse } from '../../../shared/interfaces/http';
import type { TagData } from '../../../shared/interfaces/api';

describe('TagAPI', () => {
  let api: TagAPI<CommonResponse>;
  let mockFetchApi: jest.Mock;

  const mockTagData: TagData = {
    tags: ['tag1', 'tag2'],
    metadata: { key: 'value' },
  };

  beforeEach(() => {
    mockFetchApi = jest.fn(() =>
      Promise.resolve({
        success: true,
        data: mockTagData,
      })
    );

    const mockEnvironment = new MockEnvironment('test-fingerprint');
    api = new TagAPI<CommonResponse>({
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
        metadata: { key: 'value' },
      };

      await api.updateTags('test-fingerprint-id', request);

      expect(mockFetchApi).toHaveBeenCalledWith('/tag/test-fingerprint-id', {
        method: HttpMethod.PUT,
        body: request,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockImplementationOnce(() =>
        Promise.reject(new Error('API Error'))
      );
      await expect(
        api.updateTags('test-fingerprint-id', { tags: ['tag1'] })
      ).rejects.toThrow();
    });
  });

  describe('getTags', () => {
    it('should call API with correct parameters', async () => {
      await api.getTags('test-fingerprint-id');

      expect(mockFetchApi).toHaveBeenCalledWith('/tag/test-fingerprint-id', {
        method: HttpMethod.GET,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockImplementationOnce(() =>
        Promise.reject(new Error('API Error'))
      );
      await expect(api.getTags('test-fingerprint-id')).rejects.toThrow();
    });
  });

  describe('deleteTags', () => {
    it('should call API with correct parameters', async () => {
      await api.deleteTags('test-fingerprint-id');

      expect(mockFetchApi).toHaveBeenCalledWith('/tag/test-fingerprint-id', {
        method: HttpMethod.DELETE,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockImplementationOnce(() =>
        Promise.reject(new Error('API Error'))
      );
      await expect(api.deleteTags('test-fingerprint-id')).rejects.toThrow();
    });
  });
});
