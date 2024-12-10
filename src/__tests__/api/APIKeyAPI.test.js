import { jest } from '@jest/globals';
import { APIKeyAPI } from '../../api/APIKeyAPI';
import { createMockFetchApi, mockBaseAPI, mockResponse, } from '../utils/testUtils';
jest.mock('@/api/BaseAPI', () => mockBaseAPI());
describe('APIKeyAPI', () => {
    let api;
    let mockFetchApi;
    beforeEach(() => {
        mockFetchApi = createMockFetchApi();
        api = new APIKeyAPI({
            baseUrl: 'http://test.com',
            apiKey: 'test-key',
        });
        api.fetchApi = mockFetchApi;
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('createAPIKey', () => {
        it('should create API key', async () => {
            const mockAPIKeyData = {
                id: 'test-id',
                key: 'test-key',
                name: 'test-key',
                permissions: ['read', 'write'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockFetchApi.mockResolvedValueOnce(mockResponse(mockAPIKeyData));
            const result = await api.createAPIKey({
                name: 'test-key',
                permissions: ['read', 'write'],
            });
            expect(result.data).toEqual(mockAPIKeyData);
            expect(mockFetchApi).toHaveBeenCalledWith('/api-key', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'test-key',
                    permissions: ['read', 'write'],
                }),
            });
        });
        it('should handle errors', async () => {
            const error = new Error('API Error');
            mockFetchApi.mockRejectedValueOnce(error);
            await expect(api.createAPIKey({
                name: 'test-key',
                permissions: ['read', 'write'],
            })).rejects.toThrow('Failed to create API key: API Error');
        });
    });
    describe('getAPIKey', () => {
        it('should get API key', async () => {
            const mockAPIKeyData = {
                id: 'test-id',
                key: 'test-key',
                name: 'test-key',
                permissions: ['read', 'write'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockFetchApi.mockResolvedValueOnce(mockResponse(mockAPIKeyData));
            const result = await api.getAPIKey('test-id');
            expect(result.data).toEqual(mockAPIKeyData);
            expect(mockFetchApi).toHaveBeenCalledWith('/api-key/test-id', {
                method: 'GET',
            });
        });
        it('should handle errors', async () => {
            const error = new Error('API Error');
            mockFetchApi.mockRejectedValueOnce(error);
            await expect(api.getAPIKey('test-id')).rejects.toThrow('Failed to get API key: API Error');
        });
    });
    describe('listAPIKeys', () => {
        it('should list API keys', async () => {
            const mockAPIKeys = [
                {
                    id: 'test-id-1',
                    key: 'test-key-1',
                    name: 'test-key-1',
                    permissions: ['read'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: 'test-id-2',
                    key: 'test-key-2',
                    name: 'test-key-2',
                    permissions: ['write'],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ];
            mockFetchApi.mockResolvedValueOnce(mockResponse(mockAPIKeys));
            const result = await api.listAPIKeys();
            expect(result.data).toEqual(mockAPIKeys);
            expect(mockFetchApi).toHaveBeenCalledWith('/api-key', {
                method: 'GET',
            });
        });
        it('should handle errors', async () => {
            const error = new Error('API Error');
            mockFetchApi.mockRejectedValueOnce(error);
            await expect(api.listAPIKeys()).rejects.toThrow('Failed to list API keys: API Error');
        });
    });
    describe('updateAPIKey', () => {
        it('should update API key', async () => {
            const mockAPIKeyData = {
                id: 'test-id',
                key: 'test-key',
                name: 'updated-key',
                permissions: ['read', 'write', 'admin'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockFetchApi.mockResolvedValueOnce(mockResponse(mockAPIKeyData));
            const result = await api.updateAPIKey('test-id', {
                name: 'updated-key',
                permissions: ['read', 'write', 'admin'],
            });
            expect(result.data).toEqual(mockAPIKeyData);
            expect(mockFetchApi).toHaveBeenCalledWith('/api-key/test-id', {
                method: 'PUT',
                body: JSON.stringify({
                    name: 'updated-key',
                    permissions: ['read', 'write', 'admin'],
                }),
            });
        });
        it('should handle errors', async () => {
            const error = new Error('API Error');
            mockFetchApi.mockRejectedValueOnce(error);
            await expect(api.updateAPIKey('test-id', {
                name: 'updated-key',
                permissions: ['read', 'write', 'admin'],
            })).rejects.toThrow('Failed to update API key: API Error');
        });
    });
    describe('deleteAPIKey', () => {
        it('should delete API key', async () => {
            mockFetchApi.mockResolvedValueOnce(mockResponse(undefined));
            await api.deleteAPIKey('test-id');
            expect(mockFetchApi).toHaveBeenCalledWith('/api-key/test-id', {
                method: 'DELETE',
            });
        });
        it('should handle errors', async () => {
            const error = new Error('API Error');
            mockFetchApi.mockRejectedValueOnce(error);
            await expect(api.deleteAPIKey('test-id')).rejects.toThrow('Failed to delete API key: API Error');
        });
    });
});
