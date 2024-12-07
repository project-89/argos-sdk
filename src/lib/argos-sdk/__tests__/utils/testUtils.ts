/**
 * Mock API key for testing
 */
export const mockApiKey = 'test-api-key';

/**
 * Mock headers used in API requests
 */
export const mockHeaders = {
  'Content-Type': 'application/json',
  'x-api-key': mockApiKey,
};

/**
 * Mock fetch response for testing
 * @param mockFn - The jest mock function for fetch
 * @param responseData - The data to return in the response
 * @param status - The HTTP status code (default: 200)
 */
export function mockFetch(
  mockFn: any,
  responseData: any,
  status: number = 200
): void {
  mockFn.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => responseData,
  });
}
