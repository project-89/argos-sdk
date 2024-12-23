import { ApiResponse } from '../types/api';

export function mockResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export function createMockFetchApi() {
  return jest.fn();
}
