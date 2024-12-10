import { jest } from '@jest/globals';
import { RoleAPI } from '../../api/RoleAPI';
import { createMockFetchApi, mockBaseAPI, mockResponse, } from '../utils/testUtils';
jest.mock('@/api/BaseAPI', () => mockBaseAPI());
describe('RoleAPI', () => {
    let api;
    let mockFetchApi;
    beforeEach(() => {
        mockFetchApi = createMockFetchApi();
        api = new RoleAPI({
            baseUrl: 'http://test.com',
            apiKey: 'test-key',
        });
        api.fetchApi = mockFetchApi;
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
    describe('addRoles', () => {
        it('should add roles', async () => {
            const mockRoleData = {
                fingerprintId: 'test-fingerprint',
                roles: ['user'],
                timestamp: new Date().toISOString(),
            };
            mockFetchApi.mockResolvedValueOnce(mockResponse(mockRoleData));
            const result = await api.addRoles('test-fingerprint', ['user']);
            expect(result.data).toEqual(mockRoleData);
            expect(mockFetchApi).toHaveBeenCalledWith('/role', {
                method: 'POST',
                body: JSON.stringify({
                    fingerprintId: 'test-fingerprint',
                    roles: ['user'],
                }),
            });
        });
        it('should handle errors', async () => {
            const error = new Error('API Error');
            mockFetchApi.mockRejectedValueOnce(error);
            await expect(api.addRoles('test-fingerprint', ['user'])).rejects.toThrow('Failed to add roles: API Error');
        });
    });
    describe('getRoles', () => {
        it('should get roles', async () => {
            const mockRoleData = {
                fingerprintId: 'test-fingerprint',
                roles: ['user'],
                timestamp: new Date().toISOString(),
            };
            mockFetchApi.mockResolvedValueOnce(mockResponse(mockRoleData));
            const result = await api.getRoles('test-fingerprint');
            expect(result.data).toEqual(mockRoleData);
            expect(mockFetchApi).toHaveBeenCalledWith('/role/test-fingerprint', {
                method: 'GET',
            });
        });
        it('should handle errors', async () => {
            const error = new Error('API Error');
            mockFetchApi.mockRejectedValueOnce(error);
            await expect(api.getRoles('test-fingerprint')).rejects.toThrow('Failed to get roles: API Error');
        });
    });
    describe('removeRoles', () => {
        it('should remove roles', async () => {
            const mockRoleData = {
                fingerprintId: 'test-fingerprint',
                roles: [],
                timestamp: new Date().toISOString(),
            };
            mockFetchApi.mockResolvedValueOnce(mockResponse(mockRoleData));
            const result = await api.removeRoles('test-fingerprint', ['user']);
            expect(result.data).toEqual(mockRoleData);
            expect(mockFetchApi).toHaveBeenCalledWith('/role', {
                method: 'DELETE',
                body: JSON.stringify({
                    fingerprintId: 'test-fingerprint',
                    roles: ['user'],
                }),
            });
        });
        it('should handle errors', async () => {
            const error = new Error('API Error');
            mockFetchApi.mockRejectedValueOnce(error);
            await expect(api.removeRoles('test-fingerprint', ['user'])).rejects.toThrow('Failed to remove roles: API Error');
        });
    });
});
