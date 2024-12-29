import { jest } from '@jest/globals';
import { ImpressionAPI } from '../../../shared/api/ImpressionAPI';
import { MockEnvironment } from '../../../__tests__/utils/testUtils';
import { HttpMethod, CommonResponse } from '../../../shared/interfaces/http';
import type { ImpressionData } from '../../../shared/interfaces/api';

describe('ImpressionAPI', () => {
  let api: ImpressionAPI<CommonResponse>;
  let mockFetchApi: jest.Mock;

  const mockImpressionData: ImpressionData = {
    id: 'test-impression-id',
    fingerprintId: 'test-fingerprint-id',
    type: 'test-type',
    data: { key: 'value' },
    createdAt: new Date().toISOString(),
    source: 'test-source',
    sessionId: 'test-session',
  };

  beforeEach(() => {
    mockFetchApi = jest.fn(() =>
      Promise.resolve({
        success: true,
        data: mockImpressionData,
      })
    );

    const mockEnvironment = new MockEnvironment('test-fingerprint');
    api = new ImpressionAPI<CommonResponse>({
      baseUrl: 'http://test.com',
      environment: mockEnvironment,
      debug: true,
    });
    (api as any).fetchApi = mockFetchApi;
  });

  describe('createImpression', () => {
    it('should call API with correct parameters', async () => {
      const request = {
        fingerprintId: 'test-fingerprint-id',
        type: 'test-type',
        data: { key: 'value' },
        source: 'test-source',
        sessionId: 'test-session',
      };

      await api.createImpression(request);

      expect(mockFetchApi).toHaveBeenCalledWith('/impressions', {
        method: HttpMethod.POST,
        body: request,
      });
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockImplementationOnce(() =>
        Promise.reject(new Error('API Error'))
      );
      await expect(
        api.createImpression({
          fingerprintId: 'test-fingerprint-id',
          type: 'test-type',
          data: {},
        })
      ).rejects.toThrow();
    });
  });

  describe('getImpressions', () => {
    it('should call API with correct parameters', async () => {
      const options = {
        type: 'test-type',
        startTime: '2023-01-01',
        endTime: '2023-01-02',
        limit: 10,
        sessionId: 'test-session',
      };

      mockFetchApi.mockImplementationOnce(() =>
        Promise.resolve({
          success: true,
          data: [mockImpressionData],
        })
      );

      await api.getImpressions('test-fingerprint-id', options);

      expect(mockFetchApi).toHaveBeenCalledWith(
        '/impressions/test-fingerprint-id?type=test-type&startTime=2023-01-01&endTime=2023-01-02&limit=10&sessionId=test-session',
        {
          method: HttpMethod.GET,
        }
      );
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockImplementationOnce(() =>
        Promise.reject(new Error('API Error'))
      );
      await expect(api.getImpressions('test-fingerprint-id')).rejects.toThrow();
    });
  });

  describe('deleteImpressions', () => {
    it('should call API with correct parameters', async () => {
      const options = {
        type: 'test-type',
        startTime: '2023-01-01',
        endTime: '2023-01-02',
        sessionId: 'test-session',
      };

      mockFetchApi.mockImplementationOnce(() =>
        Promise.resolve({
          success: true,
          data: { deletedCount: 5 },
        })
      );

      await api.deleteImpressions('test-fingerprint-id', options);

      expect(mockFetchApi).toHaveBeenCalledWith(
        '/impressions/test-fingerprint-id?type=test-type&startTime=2023-01-01&endTime=2023-01-02&sessionId=test-session',
        {
          method: HttpMethod.DELETE,
        }
      );
    });

    it('should handle API errors', async () => {
      mockFetchApi.mockImplementationOnce(() =>
        Promise.reject(new Error('API Error'))
      );
      await expect(
        api.deleteImpressions('test-fingerprint-id')
      ).rejects.toThrow();
    });
  });
});
