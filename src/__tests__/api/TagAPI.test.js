import { jest } from '@jest/globals';
import { TagAPI } from '../../api/TagAPI';
import { createMockFetchApi, mockBaseAPI, mockResponse, } from '../utils/testUtils';
jest.mock('@/api/BaseAPI', () => mockBaseAPI());
describe('TagAPI', () => {
    let api;
    let mockFetchApi;
    beforeEach(() => {
        mockFetchApi = createMockFetchApi();
        api = new TagAPI({
            baseUrl: 'http://test.com',
            apiKey: 'test-key',
        });
        api.fetchApi = mockFetchApi;
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('updateTags', () => {
        const mockTags = ['test-tag'];
        const mockFingerprintId = 'test-fingerprint';
        it('should update tags', async () => {
            const expectedResponse = {
                fingerprintId: mockFingerprintId,
                tags: mockTags,
                timestamp: new Date().toISOString(),
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
            await expect(api.updateTags(mockFingerprintId, { tags: mockTags })).rejects.toThrow('Failed to update tags: API Error');
        });
    });
    describe('getTags', () => {
        const mockFingerprintId = 'test-fingerprint';
        it('should get tags', async () => {
            const expectedResponse = {
                fingerprintId: mockFingerprintId,
                tags: ['test-tag'],
                timestamp: new Date().toISOString(),
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
            await expect(api.getTags(mockFingerprintId)).rejects.toThrow('Failed to get tags: API Error');
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
            await expect(api.deleteTags(mockFingerprintId)).rejects.toThrow('Failed to delete tags: API Error');
        });
    });
});
