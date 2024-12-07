import { ApiResponse } from '../types/api';

/**
 * Base class for all API classes providing common functionality
 */
export abstract class BaseAPI {
  protected baseUrl: string;
  protected apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Make a GET request
   * @param endpoint - The API endpoint to call
   * @returns Promise resolving to the response data
   */
  protected async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make a POST request
   * @param endpoint - The API endpoint to call
   * @param data - The data to send in the request body
   * @returns Promise resolving to the response data
   */
  protected async post<T>(
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make a DELETE request
   * @param endpoint - The API endpoint to call
   * @param data - Optional data to send in the request body
   * @returns Promise resolving to the response data
   */
  protected async delete<T>(
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Get common headers for all requests
   * @returns Headers object with common headers
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    };
  }

  /**
   * Handle the response from the API
   * @param response - The fetch response object
   * @returns Promise resolving to the response data
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  }
}
