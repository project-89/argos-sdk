/**
 * Common response type for all API endpoints
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Common error type for API errors
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
