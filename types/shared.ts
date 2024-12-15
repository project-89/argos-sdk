// API Configuration Types
export interface BaseAPIConfig {
  baseUrl: string;
  apiKey?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}
