import { jest } from '@jest/globals';
import { DebugAPI } from '../../../shared/api/DebugAPI';
import {
  MockBrowserEnvironment,
  createMockResponse,
} from '../../utils/testUtils';
import { HttpMethod } from '../../../shared/interfaces/http';
import type { Response, RequestInit } from 'node-fetch';

type FetchFunction = (url: string, init?: RequestInit) => Promise<Response>;

describe('DebugAPI', () => {
  const BASE_URL = 'https://test.example.com';
  let debugAPI: DebugAPI<Response, RequestInit>;
  let mockFetch: jest.MockedFunction<FetchFunction>;
  let mockEnvironment: MockBrowserEnvironment;

  beforeEach(() => {
    mockEnvironment = new MockBrowserEnvironment('test-fingerprint');
    mockFetch = jest.fn<FetchFunction>();
    mockEnvironment.fetch = mockFetch as any;
    debugAPI = new DebugAPI({
      baseUrl: BASE_URL,
      environment: mockEnvironment as any,
    });
  });

  describe('getDebugInfo', () => {
    it('should call API with correct parameters', async () => {
      const mockDebugInfo = { debug: 'info' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockDebugInfo));

      await debugAPI.getDebugInfo();

      expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/debug`, {
        method: HttpMethod.GET,
        headers: {
          'content-type': 'application/json',
          'user-agent': 'test-fingerprint',
        },
      });
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));
      await expect(debugAPI.getDebugInfo()).rejects.toThrow(
        'Failed to get debug info: API Error'
      );
    });
  });
});
