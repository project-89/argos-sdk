import { jest } from '@jest/globals';
import { FingerprintAPI } from '../../api/FingerprintAPI';
import { createMockFetchApi, mockBaseAPI, mockResponse, } from '../utils/testUtils';
jest.mock('@/api/BaseAPI', () => mockBaseAPI());
describe('FingerprintAPI', () => {
    let api;
    let mockFetchApi;
    beforeEach(() => {
        mockFetchApi = createMockFetchApi();
        api = new FingerprintAPI({
            baseUrl: 'http://test.com',
            apiKey: 'test-key',
        });
        api.fetchApi = mockFetchApi;
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('createFingerprint', () => {
        it('should create fingerprint', async () => {
            const mockFingerprintData = {
                id: 'test-id',
                userAgent: 'test-user-agent',
                ip: '127.0.0.1',
                metadata: {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockFetchApi.mockResolvedValueOnce(mockResponse(mockFingerprintData));
            const result = await api.createFingerprint({
                userAgent: 'test-user-agent',
                ip: '127.0.0.1',
                metadata: {},
            });
            expect(result.data).toEqual(mockFingerprintData);
            expect(mockFetchApi).toHaveBeenCalledWith('/fingerprint', {
                method: 'POST',
                body: JSON.stringify({
                    userAgent: 'test-user-agent',
                    ip: '127.0.0.1',
                    metadata: {},
                }),
            });
        });
        it('should handle errors', async () => {
            const error = new Error('API Error');
            mockFetchApi.mockRejectedValueOnce(error);
            await expect(api.createFingerprint({
                userAgent: 'test-user-agent',
                ip: '127.0.0.1',
                metadata: {},
            })).rejects.toThrow('Failed to create fingerprint: API Error');
        });
    });
    describe('getFingerprint', () => {
        it('should get fingerprint', async () => {
            const mockFingerprintData = {
                id: 'test-id',
                userAgent: 'test-user-agent',
                ip: '127.0.0.1',
                metadata: {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockFetchApi.mockResolvedValueOnce(mockResponse(mockFingerprintData));
            const result = await api.getFingerprint('test-id');
            expect(result.data).toEqual(mockFingerprintData);
            expect(mockFetchApi).toHaveBeenCalledWith('/fingerprint/test-id', {
                method: 'GET',
            });
        });
        it('should handle errors', async () => {
            const error = new Error('API Error');
            mockFetchApi.mockRejectedValueOnce(error);
            await expect(api.getFingerprint('test-id')).rejects.toThrow('Failed to get fingerprint: API Error');
        });
    });
    describe('updateFingerprint', () => {
        it('should update fingerprint', async () => {
            const mockFingerprintData = {
                id: 'test-id',
                userAgent: 'updated-user-agent',
                ip: '127.0.0.1',
                metadata: { updated: true },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            mockFetchApi.mockResolvedValueOnce(mockResponse(mockFingerprintData));
            const result = await api.updateFingerprint('test-id', {
                userAgent: 'updated-user-agent',
                metadata: { updated: true },
            });
            expect(result.data).toEqual(mockFingerprintData);
            expect(mockFetchApi).toHaveBeenCalledWith('/fingerprint/test-id', {
                method: 'PUT',
                body: JSON.stringify({
                    userAgent: 'updated-user-agent',
                    metadata: { updated: true },
                }),
            });
        });
        it('should handle errors', async () => {
            const error = new Error('API Error');
            mockFetchApi.mockRejectedValueOnce(error);
            await expect(api.updateFingerprint('test-id', {
                userAgent: 'updated-user-agent',
                metadata: { updated: true },
            })).rejects.toThrow('Failed to update fingerprint: API Error');
        });
    });
    describe('deleteFingerprint', () => {
        it('should delete fingerprint', async () => {
            mockFetchApi.mockResolvedValueOnce(mockResponse(undefined));
            await api.deleteFingerprint('test-id');
            expect(mockFetchApi).toHaveBeenCalledWith('/fingerprint/test-id', {
                method: 'DELETE',
            });
        });
        it('should handle errors', async () => {
            const error = new Error('API Error');
            mockFetchApi.mockRejectedValueOnce(error);
            await expect(api.deleteFingerprint('test-id')).rejects.toThrow('Failed to delete fingerprint: API Error');
        });
    });
});
