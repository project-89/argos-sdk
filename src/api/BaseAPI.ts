import { ApiResponse } from '../types/api';
import { isPublicEndpoint, HttpMethod } from '../constants/endpoints';

export interface BaseAPIConfig {
  baseUrl: string;
  apiKey?: string;
}

export class BaseAPI {
  protected baseUrl: string;
  protected apiKey?: string;

  constructor(config: BaseAPIConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  protected async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = (options.method || 'GET') as HttpMethod;
    const isPublic = isPublicEndpoint(endpoint, method);

    if (!isPublic && !this.apiKey) {
      throw new Error('API key required for this operation');
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(!isPublic && this.apiKey ? { 'X-API-Key': this.apiKey } : {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new Error(
          `Rate limit exceeded. Try again in ${retryAfter} seconds`
        );
      }

      const error = await response.json().catch(() => ({
        error: response.statusText || 'API request failed',
      }));
      throw new Error(error.error || 'API request failed');
    }

    const data = await response.json();
    return {
      success: true,
      data: data as T,
    };
  }
}
