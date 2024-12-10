import { jest } from '@jest/globals';
import { VisitAPI } from '../../api/VisitAPI';
import { createMockFetchApi, mockBaseAPI, mockResponse, } from '../utils/testUtils';
jest.mock('@/api/BaseAPI', () => mockBaseAPI());
describe('VisitAPI', () => {
    let api;
    let mockFetchApi;
    beforeEach(() => {
        mockFetchApi = createMockFetchApi();
        api = new VisitAPI({
            baseUrl: 'http://test.com',
            apiKey: 'test-key',
        });
        api.fetchApi = mockFetchApi;
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('createVisit', () => {
        it('should create visit', async () => {
            const mockVisit = {
                id: 'test-id',
                fingerprintId: 'test-fingerprint',
                url: 'http://test.com',
                timestamp: new Date().toISOString(),
            };
            mockFetchApi.mockResolvedValueOnce(mockResponse(mockVisit));
            const result = await api.createVisit(mockVisit);
            expect(result.data).toEqual(mockVisit);
            expect(mockFetchApi).toHaveBeenCalledWith('/visit', {
                method: 'POST',
                body: JSON.stringify(mockVisit),
            });
        });
        it('should handle errors', async () => {
            const error = new Error('API Error');
            mockFetchApi.mockRejectedValueOnce(error);
            await expect(api.createVisit({
                id: 'test-id',
                fingerprintId: 'test-fingerprint',
                url: 'http://test.com',
                timestamp: new Date().toISOString(),
            })).rejects.toThrow('Failed to create visit: API Error');
        });
    });
    describe('getVisits', () => {
        it('should get visits', async () => {
            const mockVisits = [
                {
                    id: 'test-id',
                    fingerprintId: 'test-fingerprint',
                    url: 'http://test.com',
                    timestamp: new Date().toISOString(),
                },
            ];
            mockFetchApi.mockResolvedValueOnce(mockResponse(mockVisits));
            const result = await api.getVisits();
            expect(result.data).toEqual(mockVisits);
            expect(mockFetchApi).toHaveBeenCalledWith('/visit', {
                method: 'GET',
            });
        });
        it('should handle errors', async () => {
            const error = new Error('API Error');
            mockFetchApi.mockRejectedValueOnce(error);
            await expect(api.getVisits()).rejects.toThrow('Failed to get visits: API Error');
        });
    });
});
