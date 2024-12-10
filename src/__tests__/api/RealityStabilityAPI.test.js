import { jest } from '@jest/globals';
import { RealityStabilityAPI } from '../../api/RealityStabilityAPI';
import { createMockFetchApi, mockBaseAPI, mockResponse, } from '../utils/testUtils';
jest.mock('@/api/BaseAPI', () => mockBaseAPI());
describe('RealityStabilityAPI', () => {
    let api;
    let mockFetchApi;
    beforeEach(() => {
        mockFetchApi = createMockFetchApi();
        api = new RealityStabilityAPI({
            baseUrl: 'http://test.com',
            apiKey: 'test-key',
        });
        api.fetchApi = mockFetchApi;
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('getCurrentStability', () => {
        it('should get current stability', async () => {
            const expectedResponse = {
                stabilityIndex: 0.85,
                currentPrice: 100,
                priceChange: 5,
                timestamp: new Date().toISOString(),
            };
            mockFetchApi.mockResolvedValueOnce(mockResponse(expectedResponse));
            const result = await api.getCurrentStability();
            expect(result.data).toEqual(expectedResponse);
            expect(mockFetchApi).toHaveBeenCalledWith('/reality-stability', {
                method: 'GET',
            });
        });
        it('should handle errors', async () => {
            const error = new Error('API Error');
            mockFetchApi.mockRejectedValueOnce(error);
            await expect(api.getCurrentStability()).rejects.toThrow('Failed to get current stability: API Error');
        });
    });
});
