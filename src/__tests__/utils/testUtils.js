import { jest } from '@jest/globals';
export function createMockFetchApi() {
    return jest.fn().mockReturnValue(Promise.resolve({
        success: true,
        data: {},
    }));
}
export function createMockFetch() {
    return jest.fn().mockReturnValue(Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
    }));
}
export function mockBaseAPI() {
    return {
        BaseAPI: jest.fn().mockImplementation(() => ({
            fetchApi: createMockFetchApi(),
        })),
    };
}
export function mockResponse(data) {
    return {
        success: true,
        data,
    };
}
export function mockErrorResponse(message) {
    return {
        success: false,
        data: undefined,
        error: message,
    };
}
export function mockFetchResponse(data) {
    return {
        ok: true,
        json: () => Promise.resolve({ success: true, data }),
    };
}
export function mockFetchErrorResponse(message) {
    return {
        ok: false,
        json: () => Promise.resolve({ success: false, error: message }),
    };
}
