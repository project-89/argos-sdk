import { jest } from '@jest/globals';
import { NodeEnvironment } from '../../../server/environment/NodeEnvironment';
import { HttpMethod } from '../../../shared/interfaces/http';
import type { Response } from 'node-fetch';
import {
  createMockResponse,
  createMockErrorResponse,
} from '../../utils/testUtils';

type FetchFunction = (url: string, init?: any) => Promise<Response>;

describe('NodeEnvironment', () => {
  let environment: NodeEnvironment;
  let mockFetch: jest.MockedFunction<FetchFunction>;

  beforeEach(() => {
    mockFetch = jest.fn<FetchFunction>();
    environment = new NodeEnvironment('test-fingerprint');
    (environment as any).fetch = mockFetch;
  });

  describe('fetch', () => {
    it('should call fetch with correct parameters', async () => {
      const mockApiResponse = {
        success: true,
        data: 'test',
      };

      const mockResponse = createMockResponse(mockApiResponse);
      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await environment.fetch('/test', {
        method: HttpMethod.POST,
        body: JSON.stringify({ test: 'data' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toEqual({ success: true, data: mockApiResponse });

      expect(mockFetch).toHaveBeenCalledWith('/test', {
        method: HttpMethod.POST,
        body: JSON.stringify({ test: 'data' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should handle fetch errors', async () => {
      const error = new Error('Fetch Error');
      mockFetch.mockRejectedValueOnce(error);

      await expect(
        environment.fetch('/test', { method: HttpMethod.GET })
      ).rejects.toThrow(error);
    });
  });

  describe('handleResponse', () => {
    it('should handle successful response', async () => {
      const mockApiResponse = {
        success: true,
        data: 'test',
      };

      const mockResponse = createMockResponse(mockApiResponse);
      const result = await environment.handleResponse(mockResponse);
      expect(result).toEqual({ success: true, data: mockApiResponse });
    });

    it('should handle error response', async () => {
      const mockResponse = createMockErrorResponse('Test Error');
      await expect(environment.handleResponse(mockResponse)).rejects.toThrow(
        'Test Error'
      );
    });
  });
});
