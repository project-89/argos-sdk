import { jest } from '@jest/globals';
import { DebugAPI } from '../../api/DebugAPI';
import { createMockFetchApi, mockBaseAPI, mockResponse, } from '../utils/testUtils';
jest.mock('@/api/BaseAPI', () => mockBaseAPI());
describe('DebugAPI', () => {
    let api;
    let mockFetchApi;
    beforeEach(() => {
        mockFetchApi = createMockFetchApi();
        api = new DebugAPI({
            baseUrl: 'http://test.com',
            apiKey: 'test-key',
        });
        api.fetchApi = mockFetchApi;
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('getDebugInfo', () => {
        it('should get debug info', async () => {
            const expectedResponse = {
                message: 'test message',
                level: 'info',
                timestamp: new Date().toISOString(),
                metadata: { test: true },
            };
            mockFetchApi.mockResolvedValueOnce(mockResponse(expectedResponse));
            const result = await api.getDebugInfo();
            expect(result.data).toEqual(expectedResponse);
            expect(mockFetchApi).toHaveBeenCalledWith('/debug/info', {
                method: 'GET',
            });
        });
        it('should handle errors', async () => {
            const error = new Error('API Error');
            mockFetchApi.mockRejectedValueOnce(error);
            await expect(api.getDebugInfo()).rejects.toThrow('Failed to get debug info: API Error');
        });
    });
});