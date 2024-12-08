import { jest } from '@jest/globals';
import { ApiResponse } from '../../types/api';

type FetchApiFunction<T> = () => Promise<ApiResponse<T>>;
type FetchFunction = typeof fetch;

export function createMockFetchApi<T = any>() {
  return jest.fn<FetchApiFunction<T>>().mockReturnValue(
    Promise.resolve({
      success: true,
      data: {} as T,
    })
  );
}

export function createMockFetch() {
  return jest.fn<FetchFunction>().mockReturnValue(
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} }),
    } as Response)
  );
}

export function mockBaseAPI() {
  return {
    BaseAPI: jest.fn().mockImplementation(() => ({
      fetchApi: createMockFetchApi(),
    })),
  };
}

export function mockResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export function mockErrorResponse(message: string): ApiResponse<never> {
  return {
    success: false,
    data: undefined as never,
    error: message,
  };
}

export function mockFetchResponse<T>(data: T): Response {
  return {
    ok: true,
    json: () => Promise.resolve({ success: true, data }),
  } as Response;
}

export function mockFetchErrorResponse(message: string): Response {
  return {
    ok: false,
    json: () => Promise.resolve({ success: false, error: message }),
  } as Response;
}
