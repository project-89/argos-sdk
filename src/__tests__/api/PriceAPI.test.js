import { jest } from '@jest/globals';
import { PriceAPI } from '../../api/PriceAPI';
import { createMockFetchApi, mockBaseAPI, mockResponse, } from '../utils/testUtils';
jest.mock('@/api/BaseAPI', () => mockBaseAPI());
describe('PriceAPI', () => {
    let api;
    let mockFetchApi;
    beforeEach(() => {
        mockFetchApi = createMockFetchApi();
        api = new PriceAPI({
            baseUrl: 'http://test.com',
            apiKey: 'test-key',
        });
        api.fetchApi = mockFetchApi;
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('getCurrentPrice', () => {
        it('should get current price', async () => {
            const expectedResponse = {
                id: 'test-id',
                amount: 100,
                currency: 'USD',
                timestamp: new Date().toISOString(),
            };
            mockFetchApi.mockResolvedValueOnce(mockResponse(expectedResponse));
            const result = await api.getCurrentPrice();
            expect(result.data).toEqual(expectedResponse);
            expect(mockFetchApi).toHaveBeenCalledWith('/price/current', {
                method: 'GET',
            });
        });
        it('should handle errors', async () => {
            const error = new Error('API Error');
            mockFetchApi.mockRejectedValueOnce(error);
            await expect(api.getCurrentPrice()).rejects.toThrow('Failed to get current price: API Error');
        });
    });
    describe('getPriceHistory', () => {
        it('should get price history without date range', async () => {
            const expectedResponse = [
                {
                    id: 'test-id-1',
                    amount: 100,
                    currency: 'USD',
                    timestamp: new Date().toISOString(),
                },
                {
                    id: 'test-id-2',
                    amount: 110,
                    currency: 'USD',
                    timestamp: new Date().toISOString(),
                },
            ];
            mockFetchApi.mockResolvedValueOnce(mockResponse(expectedResponse));
            const result = await api.getPriceHistory();
            expect(result.data).toEqual(expectedResponse);
            expect(mockFetchApi).toHaveBeenCalledWith('/price/history', {
                method: 'GET',
            });
        });
        it('should get price history with date range', async () => {
            const expectedResponse = [
                {
                    id: 'test-id-1',
                    amount: 100,
                    currency: 'USD',
                    timestamp: new Date().toISOString(),
                },
                {
                    id: 'test-id-2',
                    amount: 110,
                    currency: 'USD',
                    timestamp: new Date().toISOString(),
                },
            ];
            mockFetchApi.mockResolvedValueOnce(mockResponse(expectedResponse));
            const startDate = '2023-12-01';
            const endDate = '2023-12-07';
            const result = await api.getPriceHistory(startDate, endDate);
            expect(result.data).toEqual(expectedResponse);
            expect(mockFetchApi).toHaveBeenCalledWith(`/price/history?startDate=${startDate}&endDate=${endDate}`, {
                method: 'GET',
            });
        });
        it('should handle errors', async () => {
            const error = new Error('API Error');
            mockFetchApi.mockRejectedValueOnce(error);
            await expect(api.getPriceHistory()).rejects.toThrow('Failed to get price history: API Error');
        });
    });
});
